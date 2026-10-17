-- WineVault: one-paste setup for a NEW Supabase project.
--
-- Paste this whole file into the Supabase SQL Editor and click Run. It is safe to run more than once.
-- It replaces running the older scripts one by one: it creates the tables, the role-based Row Level
-- Security policies, the storage buckets and nine sample wines.
--
-- Admins are users whose app_metadata contains {"role": "admin"} (see the README for how to grant it).

-- 1. Admin check used by the policies below.
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false)
$$;

-- 2. wines: everyone can read, only admins can write.
create table if not exists wines (
  id serial primary key,
  name text not null,
  region text not null,
  year text not null,
  price decimal(10,2) not null,
  rating decimal(3,1) not null,
  review_count integer not null,
  age_worthy boolean not null default false,
  description text not null,
  tasting_notes text not null,
  aging_potential jsonb not null,
  storage_recommendations text not null,
  food_pairings text[] not null,
  image text not null,
  images text[] not null,
  type text not null,
  grape text not null,
  created_at timestamp with time zone default now()
);

alter table wines enable row level security;

drop policy if exists "Everyone can read wines" on wines;
drop policy if exists "Admins can insert wines" on wines;
drop policy if exists "Admins can update wines" on wines;
drop policy if exists "Admins can delete wines" on wines;

create policy "Everyone can read wines" on wines for select using (true);
create policy "Admins can insert wines" on wines for insert with check (public.is_admin());
create policy "Admins can update wines" on wines for update using (public.is_admin()) with check (public.is_admin());
create policy "Admins can delete wines" on wines for delete using (public.is_admin());

-- 3. tracked_wines: each user manages only their own rows.
create table if not exists tracked_wines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  wine_id integer references wines(id),
  name text not null,
  region text not null,
  year text not null,
  status text not null,
  storage text not null,
  aging_progress jsonb not null,
  image text,
  tasting_notes jsonb,
  price decimal(10,2),
  tracking_status text not null default 'tracking',
  created_at timestamp with time zone default now()
);

create index if not exists idx_tracked_wines_tracking_status on tracked_wines(tracking_status);

alter table tracked_wines enable row level security;

drop policy if exists "Users can read their own tracked wines" on tracked_wines;
drop policy if exists "Users can insert their own tracked wines" on tracked_wines;
drop policy if exists "Users can update their own tracked wines" on tracked_wines;
drop policy if exists "Users can delete their own tracked wines" on tracked_wines;

create policy "Users can read their own tracked wines" on tracked_wines for select using (auth.uid() = user_id);
create policy "Users can insert their own tracked wines" on tracked_wines for insert with check (auth.uid() = user_id);
create policy "Users can update their own tracked wines" on tracked_wines for update using (auth.uid() = user_id);
create policy "Users can delete their own tracked wines" on tracked_wines for delete using (auth.uid() = user_id);

-- 4. users: a copy of each sign-up (the admin order page shows the buyer's email).
create table if not exists users (
  id uuid references auth.users not null primary key,
  email text unique not null,
  full_name text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.users (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table users enable row level security;

drop policy if exists "Users can view their own data" on users;
drop policy if exists "Admins can view all users" on users;

create policy "Users can view their own data" on users for select using (auth.uid() = id);
create policy "Admins can view all users" on users for select using (public.is_admin());

-- 5. profiles + avatar storage.
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  bio text,
  address text,
  city text,
  state text,
  zip_code text,
  phone text,
  avatar_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table profiles enable row level security;

drop policy if exists "Users can view their own profile" on profiles;
drop policy if exists "Users can update their own profile" on profiles;
drop policy if exists "Users can insert their own profile" on profiles;

create policy "Users can view their own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update their own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert their own profile" on profiles for insert with check (auth.uid() = id);

insert into storage.buckets (id, name, public)
values ('user-content', 'user-content', true)
on conflict (id) do nothing;

drop policy if exists "Users can upload their own avatar" on storage.objects;
drop policy if exists "Anyone can view avatars" on storage.objects;

create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'user-content'
    and (storage.foldername(name))[1] = 'avatars'
    and auth.uid()::text = substring(storage.filename(name) from 1 for 36)
  );

create policy "Anyone can view avatars"
  on storage.objects for select
  using (bucket_id = 'user-content' and (storage.foldername(name))[1] = 'avatars');

-- 6. orders: customers insert and read their own; only admins see or change all of them.
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  order_number text not null unique,
  total_amount decimal(10,2) not null,
  status text not null default 'completed',
  items jsonb not null,
  shipping_address jsonb,
  payment_method text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists orders_user_id_idx on orders(user_id);
create index if not exists orders_status_idx on orders(status);
create index if not exists orders_created_at_idx on orders(created_at);

alter table orders enable row level security;

drop policy if exists "Users can insert their own orders" on orders;
drop policy if exists "Users can view their own orders" on orders;
drop policy if exists "Admins can view all orders" on orders;
drop policy if exists "Admins can update all orders" on orders;

create policy "Users can insert their own orders" on orders for insert with check (auth.uid() = user_id);
create policy "Users can view their own orders" on orders for select using (auth.uid() = user_id);
create policy "Admins can view all orders" on orders for select using (public.is_admin());
create policy "Admins can update all orders" on orders for update using (public.is_admin()) with check (public.is_admin());

-- 7. purchased_wines: read by the purchase-history page.
create table if not exists purchased_wines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  wine_id integer references wines(id) null,
  name text not null,
  region text not null,
  year text not null,
  price decimal(10,2) not null,
  quantity integer not null default 1,
  image text not null,
  order_id text not null,
  purchase_date timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

alter table purchased_wines enable row level security;

drop policy if exists "Users can read their own purchased wines" on purchased_wines;
drop policy if exists "Users can insert their own purchased wines" on purchased_wines;

create policy "Users can read their own purchased wines" on purchased_wines for select using (auth.uid() = user_id);
create policy "Users can insert their own purchased wines" on purchased_wines for insert with check (auth.uid() = user_id);

-- 8. Storage bucket for wine photos uploaded from the admin area (public to read, admins to write).
insert into storage.buckets (id, name, public)
values ('wine-images', 'wine-images', true)
on conflict (id) do nothing;

drop policy if exists "Admins can upload wine images" on storage.objects;
drop policy if exists "Admins can update wine images" on storage.objects;
drop policy if exists "Admins can delete wine images" on storage.objects;

create policy "Admins can upload wine images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'wine-images' and public.is_admin());
create policy "Admins can update wine images"
  on storage.objects for update to authenticated
  using (bucket_id = 'wine-images' and public.is_admin());
create policy "Admins can delete wine images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'wine-images' and public.is_admin());

-- 9. Sample wines (ids 1 to 4 are linked from the home page, so keep them).
insert into wines
  (id, name, region, year, price, rating, review_count, age_worthy, description, tasting_notes,
   aging_potential, storage_recommendations, food_pairings, image, images, type, grape)
values
  (1, 'Château Margaux 2015', 'Bordeaux, France', '2015', 699, 4.9, 124, true,
   'The 2015 Château Margaux is a blend of 87% Cabernet Sauvignon, 8% Merlot, 3% Cabernet Franc and 2% Petit Verdot. Deep garnet-purple colored, the nose features fragrant notes of warm blackberries, cassis and redcurrants with touches of cedar chest, roses, pencil shavings and forest floor. Medium to full-bodied with a firm, grainy texture and packed with tightly wound black fruits and floral layers, it has a long, mineral-laced finish. Drink now through 2055.',
   'Exhibits a deep garnet-purple color with an incredibly fragrant nose of warm blackberries, cassis, and redcurrants, complemented by notes of cedar chest, roses, pencil shavings, and forest floor.',
   '{"drinkFrom":2023,"peakMaturity":2030,"drinkUntil":2055}'::jsonb, 'Store in a cool, dark place with a constant temperature between 50-59°F (10-15°C) and humidity around 70%. Keep bottles on their side to keep the cork moist.',
   array['Prime Rib', 'Lamb Chops', 'Aged Cheeses', 'Truffle Dishes']::text[], '/chateau-margaux-bottle.png', array['/chateau-margaux-bottle.png', '/margaux-vineyard-autumn.png', '/red-wine-pour.png', '/vintage-wine-cellar.png']::text[], 'red', 'Cabernet Sauvignon blend'),
  (2, 'Opus One 2018', 'Napa Valley, USA', '2018', 399, 4.8, 98, true,
   'The 2018 Opus One is a blend of 84% Cabernet Sauvignon, 6% Petit Verdot, 5% Merlot, 4% Cabernet Franc and 1% Malbec. Deep garnet-purple in color, it comes charging out of the gate with expressive notes of black cherries, mulberries, black currants and licorice plus touches of red roses and spearmint and a waft of dusty soil. Medium to full-bodied, the palate is tightly wound with layers of black and red fruits, floral notions and spicy accents, framed by firm, grainy tannins and a lively backbone, finishing long and fragrant.',
   'Expressive notes of black cherries, mulberries, black currants, and licorice with touches of red roses and spearmint. The palate is tightly wound with layers of black and red fruits, floral notions, and spicy accents.',
   '{"drinkFrom":2023,"peakMaturity":2028,"drinkUntil":2038}'::jsonb, 'Store in a cool, dark place with a constant temperature between 50-59°F (10-15°C) and humidity around 70%. Keep bottles on their side to keep the cork moist.',
   array['Filet Mignon', 'Venison', 'Mushroom Risotto', 'Dark Chocolate']::text[], '/elegant-red-wine.png', array['/elegant-red-wine.png', '/napa-vineyard-estate.png', '/decanted-red-wine.png', '/decanted-red-wine.png']::text[], 'red', 'Cabernet Sauvignon blend'),
  (3, 'Dom Pérignon 2012', 'Champagne, France', '2012', 249, 4.7, 112, true,
   'The 2012 Dom Pérignon is a stunning champagne that captures the essence of the vintage. The bouquet is complex and luminous, revealing notes of white flowers, citrus, and stone fruits. On the palate, it''s precise and tactile with remarkable depth and persistence. The wine unfolds with layers of ripe fruit, brioche, and a distinctive mineral character that speaks to its origins. The finish is long and harmonious with a subtle saline quality.',
   'Complex and luminous bouquet revealing notes of white flowers, citrus, and stone fruits. The palate is precise and tactile with remarkable depth and persistence, unfolding with layers of ripe fruit, brioche, and a distinctive mineral character.',
   '{"drinkFrom":2020,"peakMaturity":2023,"drinkUntil":2032}'::jsonb, 'Store in a cool, dark place with a constant temperature between 45-55°F (7-13°C) and humidity around 70%. Champagne can be stored upright, unlike still wines.',
   array['Oysters', 'Caviar', 'Sushi', 'Lobster']::text[], '/elegant-champagne.png', array['/elegant-champagne.png', '/elegant-champagne.png', '/elegant-champagne.png', '/elegant-champagne.png']::text[], 'sparkling', 'Chardonnay / Pinot Noir'),
  (4, 'Cloudy Bay Sauvignon Blanc 2022', 'Marlborough, New Zealand', '2022', 39, 4.5, 87, false,
   'The 2022 Cloudy Bay Sauvignon Blanc showcases the distinctive character of Marlborough. Vibrant and expressive, it offers intense aromas of ripe citrus, tropical fruits, and fresh herbs. The palate is crisp and focused with flavors of lime, passionfruit, and a hint of jalapeño, all balanced by a refreshing acidity and a long, mineral-driven finish. This wine captures the essence of New Zealand Sauvignon Blanc at its finest.',
   'Intense aromas of ripe citrus, tropical fruits, and fresh herbs. The palate is crisp and focused with flavors of lime, passionfruit, and a hint of jalapeño, all balanced by a refreshing acidity and a long, mineral-driven finish.',
   '{"drinkFrom":2022,"peakMaturity":2023,"drinkUntil":2025}'::jsonb, 'Best enjoyed young and fresh. Store in a cool, dark place with a constant temperature between 45-55°F (7-13°C). Consume within 2-3 years of vintage for optimal freshness.',
   array['Seafood', 'Goat Cheese', 'Asparagus', 'Thai Cuisine']::text[], '/sauvignon-blanc-bottle.png', array['/sauvignon-blanc-bottle.png', '/chilled-white-wine.png', '/chilled-white-wine.png', '/chilled-white-wine.png']::text[], 'white', 'Sauvignon Blanc'),
  (5, 'Tignanello 2019', 'Tuscany, Italy', '2019', 149, 4.6, 76, true,
   'The 2019 Tignanello is a masterful Super Tuscan blend of Sangiovese, Cabernet Sauvignon, and Cabernet Franc. It presents a deep ruby-red color with aromas of ripe red fruits, spices, and hints of tobacco and leather. On the palate, it''s full-bodied and well-structured with elegant tannins and a harmonious balance between fruit, acidity, and oak. The finish is long and persistent with notes of dark chocolate and Mediterranean herbs.',
   'Deep ruby-red color with aromas of ripe red fruits, spices, and hints of tobacco and leather. Full-bodied and well-structured with elegant tannins and a harmonious balance between fruit, acidity, and oak.',
   '{"drinkFrom":2022,"peakMaturity":2029,"drinkUntil":2039}'::jsonb, 'Store in a cool, dark place with a constant temperature between 50-59°F (10-15°C) and humidity around 70%. Keep bottles on their side to keep the cork moist.',
   array['Bistecca alla Fiorentina', 'Wild Boar Ragu', 'Aged Pecorino', 'Porcini Mushrooms']::text[], '/decanted-red-wine.png', array['/decanted-red-wine.png', '/decanted-red-wine.png', '/decanted-red-wine.png', '/decanted-red-wine.png']::text[], 'red', 'Sangiovese blend'),
  (6, 'Penfolds Grange 2017', 'South Australia', '2017', 599, 4.9, 65, true,
   'The 2017 Penfolds Grange is a monumental Australian wine, primarily Shiraz with a touch of Cabernet Sauvignon. It displays a deep, saturated color with complex aromas of blackberry, plum, licorice, and exotic spices, complemented by notes of cedar and vanilla from oak aging. The palate is incredibly concentrated and powerful, yet maintains remarkable balance and finesse. Layers of dark fruits, chocolate, and spice unfold across a framework of fine-grained tannins, leading to an extraordinarily long finish.',
   'Deep, saturated color with complex aromas of blackberry, plum, licorice, and exotic spices, complemented by notes of cedar and vanilla. Incredibly concentrated and powerful, yet maintains remarkable balance and finesse.',
   '{"drinkFrom":2022,"peakMaturity":2037,"drinkUntil":2057}'::jsonb, 'Store in a cool, dark place with a constant temperature between 50-59°F (10-15°C) and humidity around 70%. Keep bottles on their side to keep the cork moist. This wine will benefit from long-term cellaring.',
   array['Aged Beef', 'Game Meats', 'Strong Cheeses', 'Dark Chocolate']::text[], '/decanted-red-wine.png', array['/decanted-red-wine.png', '/decanted-red-wine.png', '/decanted-red-wine.png', '/decanted-red-wine.png']::text[], 'red', 'Shiraz'),
  (7, 'Veuve Clicquot Brut', 'Champagne, France', 'NV', 59, 4.4, 132, false,
   'Veuve Clicquot Brut Yellow Label is the signature champagne of the House. Dominated by Pinot Noir, it offers a perfect balance of structure and finesse. The wine displays bright fruitiness, a harmonious balance, and a pleasant silkiness that allows it to be enjoyed as an aperitif or throughout a meal. The initial notes of white fruits and raisins develop into vanilla and later brioche. The combination of modern winemaking techniques and a centuries-old tradition results in a champagne that is both accessible and sophisticated.',
   'Initial notes of white fruits and raisins develop into vanilla and later brioche. The palate offers bright fruitiness, a harmonious balance, and a pleasant silkiness with fine, persistent bubbles.',
   '{"drinkFrom":2020,"peakMaturity":2022,"drinkUntil":2024}'::jsonb, 'Store in a cool, dark place with a constant temperature between 45-55°F (7-13°C). Non-vintage champagne is best consumed within 3-4 years of purchase.',
   array['Oysters', 'Smoked Salmon', 'Sushi', 'Light Appetizers']::text[], '/elegant-champagne.png', array['/elegant-champagne.png', '/elegant-champagne.png', '/elegant-champagne.png', '/elegant-champagne.png']::text[], 'sparkling', 'Pinot Noir blend'),
  (8, 'Caymus Cabernet Sauvignon 2020', 'Napa Valley, USA', '2020', 89, 4.6, 108, true,
   'The 2020 Caymus Cabernet Sauvignon continues the winery''s tradition of producing rich, accessible Napa Valley Cabernets. This wine showcases a deep purple-black color and generous aromas of ripe blackberries, cassis, and dark chocolate, with hints of vanilla and toasted oak. On the palate, it''s full-bodied and opulent with velvety tannins and a plush texture. The flavors of dark fruits, cocoa, and sweet spices are complemented by a long, smooth finish. While approachable in its youth, this wine will continue to develop complexity with age.',
   'Deep purple-black color and generous aromas of ripe blackberries, cassis, and dark chocolate, with hints of vanilla and toasted oak. Full-bodied and opulent with velvety tannins and a plush texture.',
   '{"drinkFrom":2022,"peakMaturity":2025,"drinkUntil":2030}'::jsonb, 'Store in a cool, dark place with a constant temperature between 50-59°F (10-15°C) and humidity around 70%. Keep bottles on their side to keep the cork moist.',
   array['Ribeye Steak', 'Braised Short Ribs', 'Blue Cheese', 'Dark Chocolate']::text[], '/decanted-red-wine.png', array['/decanted-red-wine.png', '/decanted-red-wine.png', '/decanted-red-wine.png', '/decanted-red-wine.png']::text[], 'red', 'Cabernet Sauvignon'),
  (9, 'Château d''Yquem 2015', 'Sauternes, France', '2015', 399, 4.9, 54, true,
   'The 2015 Château d''Yquem is a legendary Sauternes that exemplifies the pinnacle of sweet wine production. It displays a brilliant golden color with aromas of apricot, honey, vanilla, and exotic fruits, underscored by a refreshing citrus note. On the palate, it''s opulently sweet yet perfectly balanced by vibrant acidity, offering layers of tropical fruits, marmalade, and spice. The texture is silky and the finish seemingly endless, revealing new dimensions with each sip. This is a wine of extraordinary complexity and aging potential.',
   'Brilliant golden color with aromas of apricot, honey, vanilla, and exotic fruits, underscored by a refreshing citrus note. Opulently sweet yet perfectly balanced by vibrant acidity, offering layers of tropical fruits, marmalade, and spice.',
   '{"drinkFrom":2020,"peakMaturity":2035,"drinkUntil":2065}'::jsonb, 'Store in a cool, dark place with a constant temperature between 50-59°F (10-15°C) and humidity around 70%. Keep bottles on their side to keep the cork moist. Sauternes can age for decades when stored properly.',
   array['Foie Gras', 'Blue Cheese', 'Fruit Tarts', 'Crème Brûlée']::text[], '/chilled-white-wine.png', array['/chilled-white-wine.png', '/chilled-white-wine.png', '/chilled-white-wine.png', '/chilled-white-wine.png']::text[], 'white', 'Semillon / Sauvignon Blanc')
on conflict (id) do nothing;

select setval(pg_get_serial_sequence('wines', 'id'), (select max(id) from wines));
