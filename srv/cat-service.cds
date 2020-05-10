using { my.bookshop, sap.common } from '../db/data-model';

service CatalogService {
  entity Books  as projection on bookshop.Books;
  entity Authors @readonly as projection on bookshop.Authors;
  entity Orders @insertonly as projection on bookshop.Orders;
   entity Products as projection on bookshop.Products;
    entity Suppliers as projection on bookshop.Suppliers;
}