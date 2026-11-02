-- Each booking keeps the name and phone it was made with, so a later booking with the same
-- e-mail address cannot rewrite earlier ones.
alter table booking add column contact_name varchar(200);
alter table booking add column contact_phone varchar(30);

update booking set
    contact_name = (select c.name from customer c where c.id = booking.customer_id),
    contact_phone = (select c.phone from customer c where c.id = booking.customer_id);

alter table booking alter column contact_name set not null;
alter table booking alter column contact_phone set not null;
