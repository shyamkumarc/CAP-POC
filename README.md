# CAP-POC2
CAP POC - covers DB, Nodejs service ,HTML5 app router, UI deployer, XSUAA, odata v2 adapter, Fiori elements app, smart table and Freestype UI5 app & FLP

Stat here : Simple yet exhaustive information on CAP development in SCP.Some part are not relevant for our project, still it gives a good overview of the whole setup : https://blogs.sap.com/2018/12/11/programming-applications-in-sap-cloud-platform/

Step by step tutorials:
Creating a CAP project :https://blogs.sap.com/2018/11/29/develop-a-full-stack-business-application-with-cap/
Deploying to FLP: https://blogs.sap.com/2018/12/02/build-deploy-and-run-a-full-stack-sap-cloud-business-application-with-fiori-launchpad./

## Setting up Odata V2 adapter:
CAP services expose OData on the  OData v4 protocol .FIori elements work with odata v2 only , and hence we might need to consume odata in V2 protocol -  the OData V2 proxy adapter library could be used to accomplish this. But There were some issues with this library which caused it to give internal server error whenever the V2 OData was queried for.I was able to understand that this issue happens because the index.js file that was used to proxy v4 to v2 was making use of db references. Looks like Db module won't be available for CF in runtime and it seems we have to replace db reference with the generated csn file present in srv folder to get past this issue. 
 
 Youll see this being done in <B> srv/index.js </B>
 ```
  await cds
    .serve('all')
    .from(csn)
    .in(app)


  app.use(
    proxy({
      // app
      path: 'v2',
      model: csn,
      // target
      port: port
    })
  )
```  
  Do note that the odata V2 adapter proxy library has to be added in node package.Json file and also the start script has to be adjusted to execute index.js file .
  ```
  	"dependencies": {
		"@sap/cds": "^3.34.1",
		"express": "^4.17.1",
		"@sap/hana-client": "^2.4.196",
		"@sap/cds-odata-v2-adapter-proxy": "^1.4.22"
	},
	"engines": {
		"node": "^10 || ^12"
	},
	"devDependencies": {},
	"scripts": {
		"postinstall": "npm dedupe && node .build.js",
		"startv4": "node ./node_modules/@sap/cds/bin/cds.js serve gen/csn.json",
		"start": "node index.js",
```
References:
https://github.com/gregorwolf/SAP-NPM-API-collection/tree/master/apis/cds-odata-v2-adapter-proxy 
https://github.com/sapmentors/cap-community/issues/68

## Getting Fiori elements working: 

Once the odata V2 adapter is setup for use, you can get the metadata in odata V2 format at the /V2/prefixed links on same host where odata V4 is made available.

This odata V2 specific metadata can be saved in srv/gen folder as an xml file.  Further when the odata elements app is to be 
created - use the service to be from this file (use the option "within project" in service screen of wizard). 

You can also refer to the Github repo for week3, unit 2  of  CAP open sap course to understand how annotations are used 
on service CDS.
Reference: https://github.com/SAP-samples/cloud-cap-samples/tree/openSAP-week3-unit2 

Both for the Fiori elements, and the freestyle UI5 app to work , you have to adjust the XS-app JSON file so that it points to the
destination mentioned in the HTMLapprouter destinations for SRV folder services in MTA file
```
modules:
  - name: cap-poc1-approuter
    type: approuter.nodejs
    path: cap-poc1-approuter
    parameters:
      disk-quota: 256M
      memory: 256M
    requires:
      - name: CAP_POC1_html5_repo_runtime
      - name: portal_resources_CAP_POC1
      - name: srv_api
        group: destinations
        properties:
          forwardAuthToken: true
          name: srv_api
          url: '~{url}'.
```	  
	  
In Xs-app.json:
```
 "routes": [
    {
      "source": "/srv_api/(.*)$",
      "target": "$1",
      "authenticationType": "none",
      "destination": "srv_api",
      "csrfProtection": false
    },
```

## fixing FLP bug:

I was using WebIDE full stack for my development and the template for creating a CAP project is using the "SAP cloud platform business application" project. I noticed some flaws in this template which were causing the issue.

The SCP business application template doesn't seem to be defining the scope uaa.user in the XS-security file when a project is created .2.The XS-security file doesn't get linked with the XSUAA resource when a project gets created.
I went ahead and fixed both the above points and now I'm able to get the FLP instance working.
I'm not sure if the above 2 were conscious decisions based on some thought , or just a miss from the relevant team's end .

Fixes to be made:

XS-security file:
Add a scopes section , after the description section in the XS security file as follows.
```
  "tenant-mode": "dedicated",
  "description": "Security profile of called application",
   "scopes":[
	{
		"name": "uaa.user",
		"description": "UAA"
	}],
```
MTA file:

Add the path to XS-security file on XSUAA resource in your MTA file
resources:
```
 -name: uaa_CAP_POC1
     type: org.cloudfoundry.managed-service
     parameters:
       path: ./xs-security.json
       service-plan: application
       
```       

Apart from that , if your deployment fails and the log shows error : "Upload application content failed { CODE: '1001' } validation error: Error while parsing request; Error: maximum file length exceeded" , you may refer to the following note regarding fixing the HTML application repo host memory :

https://launchpad.support.sap.com/#/notes/0002764058

https://help.sap.com/viewer/65de2977205c403bbc107264b8eccf4b/Cloud/en-US/b8343d9d8b984d73adbae5fe657f13db.html
