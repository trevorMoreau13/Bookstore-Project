INSERT INTO [dbo].[Items] ([ItemName], [ItemDescription], [ItemPrice], [ItemSKU], [ItemCategory], [CreateDate])
VALUES
('The Great Adventure', 'An exciting journey through uncharted territories.', 19.99, 'SKU001', 'Books', DEFAULT),
('Epic Fantasy', 'A tale of magic, dragons, and heroes.', 25.50, 'SKU002', 'Books', DEFAULT),
('Professional JavaScript for Web Developers', 'A comprehensive guide to modern JavaScript development.', 45.99, 'SKU003', 'Books', DEFAULT),
('Stainless Steel Water Bottle', 'Keep your drink cold for 24 hours or hot for 12.', 20.00, 'SKU004', 'Accessories', DEFAULT),
('Bluetooth Headphones', 'Experience high-quality sound without the wires.', 89.99, 'SKU005', 'Electronics', DEFAULT),
('Compact Mirrorless Camera', 'Capture your moments with stunning clarity.', 599.99, 'SKU006', 'Electronics', DEFAULT),
('Ergonomic Office Chair', 'Comfort and support for long working hours.', 120.00, 'SKU007', 'Furniture', DEFAULT),
('LED Desk Lamp', 'Brighten your workspace with adjustable lighting.', 35.75, 'SKU008', 'Furniture', DEFAULT),
('Yoga Mat', 'Non-slip mat for all your yoga practices.', 25.00, 'SKU009', 'Sports', DEFAULT),
('Running Shoes', 'Designed for comfort and performance.', 50.00, 'SKU010', 'Sports', DEFAULT);

INSERT INTO [dbo].[Stock] ([ItemID], [Quantity], [LastUpdated])
VALUES
(1, 100, DEFAULT),
(2, 150, DEFAULT),
(3, 50, DEFAULT),
(4, 200, DEFAULT),
(5, 75, DEFAULT),
(6, 40, DEFAULT),
(7, 60, DEFAULT),
(8, 90, DEFAULT),
(9, 150, DEFAULT),
(10, 110, DEFAULT);


ALTER TABLE [dbo].[Items]
ADD [ItemImageURL] NVARCHAR(MAX) NULL;


UPDATE [dbo].[Items]
SET [ItemImageURL] = 'https://static.vecteezy.com/system/resources/previews/002/219/582/non_2x/illustration-of-book-icon-free-vector.jpg'
