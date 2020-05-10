namespace my.bookshop;
using { User, Country, managed, Currency } from '@sap/cds/common';

entity Books {

  key ID : Integer;
  title  : localized String;
  author : Association to Authors;
  stock  : Integer;
 
}

entity Authors {
  key ID : Integer;
  name   : String;
  books  : Association to many Books on books.author = $self;
}

entity Orders : managed {
  key ID  : UUID;
  book    : Association to Books;
  country : Country;
  amount  : Integer;
}

entity Products {
    @Common.Label   : 'UUID'
    key ID          : UUID;
    identifier      : String @Common.Label : 'ID';
    title           : localized String @( Common.Label : 'Name' );
    description     : localized String;
    availability    : Integer;
    storage_capacity: Integer;
    criticality     : Integer;
    price           : Decimal(9,2);
    currency        : Currency;
    supplier        : Association to Suppliers;
    image_url       : String;
}

entity Suppliers {
    key ID    : UUID;
    identifier: String;
    name      : String;
    phone     : String;
    building  : String;
    street    : String @multiline;
    postCode  : String;
    city      : String;
    country   : String;
    products  : Composition of many Products on products.supplier = $self;
}