-- Seed the marketplace with the launch listings from the AfroSamboza prototype.
-- All seeded rows are 'live' so the public site has content on day one.

insert into public.listings (reference_no, type, title, price, price_period, location, status, attributes) values
  -- Cars for sale
  ('AS-SEED01', 'car_sale', 'Toyota Camry 2019',       9500000,  null,  'Abuja, FCT — Wuse 2',        'live', '{"transmission":"Automatic","fuel":"Petrol","year":2019,"emoji":"🚗"}'),
  ('AS-SEED02', 'car_sale', 'Honda Accord 2020',       12000000, null,  'Abuja, FCT — Garki',         'live', '{"transmission":"Automatic","fuel":"Petrol","year":2020,"emoji":"🚙","badge":"new"}'),
  ('AS-SEED03', 'car_sale', 'Hyundai Elantra 2018',    7200000,  null,  'Lagos — Lekki Phase 1',      'live', '{"transmission":"Automatic","fuel":"Petrol","year":2018,"emoji":"🚘"}'),
  ('AS-SEED04', 'car_sale', 'Kia Sportage 2021',       16500000, null,  'Abuja, FCT — Maitama',       'live', '{"transmission":"Automatic","fuel":"Petrol","year":2021,"emoji":"🏎️","badge":"new"}'),
  ('AS-SEED05', 'car_sale', 'Toyota Highlander 2017',  14000000, null,  'Port Harcourt — GRA',        'live', '{"transmission":"Automatic","fuel":"Petrol","year":2017,"emoji":"🚐"}'),
  ('AS-SEED06', 'car_sale', 'Ford Ranger 2016',        10800000, null,  'Abuja — Asokoro',            'live', '{"transmission":"Manual","fuel":"Diesel","year":2016,"emoji":"🛻"}'),
  -- Car rentals
  ('AS-SEED07', 'car_rent', 'Toyota Corolla 2018',     25000,    'day', 'Abuja — Central Business District', 'live', '{"seats":4,"transmission":"Automatic","ac":true,"emoji":"🚗"}'),
  ('AS-SEED08', 'car_rent', 'Hyundai Tucson 2020',     40000,    'day', 'Abuja — Jabi',               'live', '{"seats":5,"transmission":"Automatic","ac":true,"emoji":"🚙"}'),
  ('AS-SEED09', 'car_rent', 'Toyota Hilux 2019',       55000,    'day', 'Lagos — Victoria Island',    'live', '{"seats":4,"transmission":"Automatic","fourwd":true,"emoji":"🏎️"}'),
  -- Houses & land
  ('AS-SEED10', 'house_sale', '3-Bedroom Duplex',      55000000, null,  'Abuja — Gwarinpa Estate',    'live', '{"beds":3,"baths":3,"size_sqm":220,"emoji":"🏠"}'),
  ('AS-SEED11', 'house_rent', '2-Bedroom Flat',        1800000,  'year','Abuja — Life Camp',          'live', '{"beds":2,"baths":2,"size_sqm":110,"emoji":"🏢"}'),
  ('AS-SEED12', 'land',       'Residential Plot – 600 sqm', 8500000, null, 'Abuja — Kuje District',   'live', '{"size_sqm":600,"title_doc":"C of O","emoji":"🌳"}'),
  ('AS-SEED13', 'house_sale', '5-Bedroom Mansion',     180000000, null, 'Abuja — Asokoro',            'live', '{"beds":5,"baths":5,"pool":true,"emoji":"🏡","badge":"new"}'),
  ('AS-SEED14', 'land',       'Commercial Land – 1,000 sqm', 22000000, null, 'Lagos — Ibeju-Lekki',   'live', '{"size_sqm":1000,"title_doc":"C of O","zone":"Commercial","emoji":"🌿"}'),
  ('AS-SEED15', 'house_rent', 'Mini Flat – Self Contain', 600000, 'year', 'Abuja — Kubwa',            'live', '{"beds":1,"baths":1,"prepaid_meter":true,"emoji":"🏘️"}');
