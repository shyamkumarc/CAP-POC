sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("ui1.ui1.controller.View1", {
			onInit: function () {
			debugger;
			var oModel = new sap.ui.model.odata.v4.ODataModel({
				/* send requests directly. Use $auto for batch request wich will be send automatically on before rendering */
				groupId: "$direct",
				/*  Controls synchronization between different bindings which refer to the same data for the case data changes in one binding.
				  Must be set to 'None' which means bindings are not synchronized at all; all other values are not supported and lead to an error.
				*/
				synchronizationMode: "None",
				/*
				Root URL of the service to request data from.
				*/
				serviceUrl: "/srv_api/catalog/",
				/*
				optional. Group ID that is used for update requests. If no update group ID is specified, mParameters.groupId is used.:
				updateGroupId : "$direct"
				*/
				updateGroupId: "AlltableChanges"
			});
			// oModel.setDefaultBindingMode("OneWay");
			this.byId('idProductsTable').setModel(oModel);
		var viewModel = new sap.ui.model.json.JSONModel({
				"reset": false,
				"save": false,
				"PendingChanges": false
			});
			this.getView().setModel(viewModel, "viewModel");

			// -- Doesnt WORK!!!!
			// oModel.read("/Books", {
			// 	success: function (oData, response) {
			// 		debugger;
			// 		console.log("Success");
			// 	},
			// 	error: function (oError) {
			// 		debugger;
			// 		console.log("Error");
			// 	}
			// });

		},
		onPress: function (oEvent) {
			debugger;
			var oBinding = this.byId('idProductsTable').getBinding("items");
			var hasChanges = oBinding.hasPendingChanges();
			if (hasChanges) {
				this.byId('idProductsTable').getModel().submitBatch("AlltableChanges")
					.then(this.fnSuccess.bind(this), this.fnError.bind(this));
			}

		},
		onPressReset: function (oEvent) {
			var oBinding = this.byId('idProductsTable').getBinding("items");
			var hasChanges = oBinding.hasPendingChanges();
			if (hasChanges) {
				oBinding.resetChanges("AlltableChanges");
				this.getView().getModel("viewModel").setProperty("/reset", false);
				this.getView().getModel("viewModel").setProperty("/save", false);
				sap.m.MessageToast.show("Changes reset");
			} else {
				this.getView().getModel("viewModel").setProperty("/reset", false);
				this.getView().getModel("viewModel").setProperty("/save", false);
				sap.m.MessageToast.show("No changes to reset");
			}
		},
		fnSuccess: function (data, response) {
			console.log("success");
			sap.m.MessageToast.show("Changes updated successfully");
			this.getView().getModel("viewModel").setProperty("/save", false);
			this.getView().getModel("viewModel").setProperty("/reset", false);
		},
		fnError: function (data, response) {
			console.log("fnError");
			sap.m.MessageToast.show("Changes not updated, please try again");
		},
		onInputChange: function(oEvent)
		{
			this.getView().getModel("viewModel").setProperty("/save", true);
			this.getView().getModel("viewModel").setProperty("/reset", true);	
		},
		onView2 : function(){
			debugger;
			this.getOwnerComponent().getRouter().navTo("RouteView2");
		}
	
	});
});