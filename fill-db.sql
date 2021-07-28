
INSERT INTO users(email, password_hash, first_name, last_name, avatar) VALUES
('ivanov@example.com', '5f4dcc3b5aa765d61d8327deb882cf99', 'Иван', 'Иванов', 'avatar1.jpg'),
('petrov@example.com', '5f4dcc3b5aa765d61d8327deb882cf99', 'Пётр', 'Петров', 'avatar2.jpg');
      
INSERT INTO categories(name) VALUES
('Книги'),
('Разное'),
('Посуда'),
('Игры'),
('Животные'),
('Журналы');

ALTER TABLE offers DISABLE TRIGGER ALL;

INSERT INTO offers(title, description, type, sum, picture, user_id) VALUES
('Продам книги Стивена Кинга', 'Продаю с болью в сердце... Если товар не понравится — верну всё до последней копейки. Таких предложений больше нет! Товар в отличном состоянии.', 'sale', 90431, 'item0NaN.jpg', 1);

ALTER TABLE offers ENABLE TRIGGER ALL;

ALTER TABLE offer_categories DISABLE TRIGGER ALL;

INSERT INTO offer_categories(offer_id, category_id) VALUES
(1, 5);

ALTER TABLE offer_categories ENABLE TRIGGER ALL;

ALTER TABLE comments DISABLE TRIGGER ALL;

INSERT INTO COMMENTS(text, user_id, offer_id) VALUES
('Вы что?! В магазине дешевле. А где блок питания? Совсем немного...', 2, 1),
('Неплохо, но дорого', 2, 1),
('А где блок питания? Неплохо, но дорого Вы что?! В магазине дешевле.', 2, 1),
('Неплохо, но дорого', 1, 1);

ALTER TABLE comments ENABLE TRIGGER ALL;