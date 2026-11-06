-- Bookings are only accepted while a car (crew) can still get to the game, so with no car nothing
-- could be booked. Start with the two cars the business always has; rename the plates on the dashboard.
insert into car (plate, seats, active)
select v.plate, 5, true
from (values ('AUTO-1'), ('AUTO-2')) as v (plate)
where not exists (select 1 from car);
