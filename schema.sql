-- 建立新婚祝福語資料表
CREATE TABLE IF NOT EXISTS wedding_wishes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content TEXT NOT NULL,
  author TEXT DEFAULT '賓客',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 預設新婚祝福語種子資料
INSERT INTO wedding_wishes (content, author) VALUES
('百年好合，永結同心！🌹', '親友團'),
('執子之手，與子偕老 💍', '伴娘'),
('新婚愉快，甜甜蜜蜜！💗', '好友小美'),
('願你們的愛情如玫瑰般永遠綻放 ✨', '伴郎阿強'),
('琴瑟和鳴，相敬如賓 💒', '大伯母'),
('永浴愛河，早生貴子 👶', '奶奶'),
('執手並肩，幸福一生一世 🌸', '大學同學'),
('佳偶天成，天作之合 🥂', '同事情友'),
('白頭偕老，恩愛一生！💑', '表姊'),
('願每個明天都比今天更加相愛 💕', '閨蜜'),
('相濡以沫，幸福滿溢 🌷', '鄰居好友'),
('今天新郎最帥，新娘最美！✨', '親友攝影師'),
('牽手走過四季，浪漫直到永遠 🎀', '學生時代好友'),
('願你們柴米油鹽皆是浪漫，歲歲年年皆有深情 🥂', '表哥'),
('願愛如初見，深情不負韶華 🕊️', '阿姨');
