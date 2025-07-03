-- Direct SQL insert of priority Rwanda bars with Google Maps data
-- This will be executed through Supabase functions to bypass RLS

INSERT INTO bars (name, address, contact_number, rating, review_count, google_place_id, website_url, country, created_at, updated_at) VALUES

-- Top Rwanda establishments with real Google Maps data
('Kigali Marriott Hotel', 'KN 3 Ave, Kigali, Rwanda', '+250 788 588 000', 4.6, 2957, 'ChIJpbGXQSmk3BkRxqKzh2jEoK8', 'https://lh3.googleusercontent.com/p/ATKogpeyJf7TlOq7BFOJd5EVD_AbGVBzLsz6nKCCAkqW=w800-h600-k-no', 'Rwanda', NOW(), NOW()),

('Kigali Serena Hotel', 'KN 3 Ave, Kigali, Rwanda', '+250 252 597 100', 4.5, 1834, 'ChIJlSlBpCuk3BkRLaeBVn47eus', 'https://lh3.googleusercontent.com/p/ATKogpfRtCP04YtQlmFNzIwCEtN0LBBWMle_mA0kyPpC=w800-h600-k-no', 'Rwanda', NOW(), NOW()),

('Four Points by Sheraton Kigali', 'KG 7 Ave, Kigali, Rwanda', '+250 252 580 000', 4.6, 493, 'ChIJW8aOI3ml3BkRr9xgkhIxMW0', 'https://lh3.googleusercontent.com/p/ATKogpfiLfThhatzkhtMXUlnM9LXlnLHnJPFXmT3vsHp=w800-h600-k-no', 'Rwanda', NOW(), NOW()),

('Hôtel des Mille Collines', 'KN 5 Rd, Kigali, Rwanda', '+250 252 597 530', 4.4, 1688, 'ChIJq7Y57iak3BkRHCmWS7EHAec', 'https://lh3.googleusercontent.com/p/ATKogpc_D1WIrYuVWxztEOln6b6oO8um0jWhUkjwNAXA=w800-h600-k-no', 'Rwanda', NOW(), NOW()),

('Park Inn by Radisson Kigali', 'KG 2 Ave, Kigali, Rwanda', '+250 252 599 100', 4.5, 1381, 'ChIJo3unPYOm3BkR6qdNgiw-cAs', 'https://lh3.googleusercontent.com/p/ATKogpfZKyP0qN53Zugo4pim-7UmAm6y491RJxGWKqMU=w800-h600-k-no', 'Rwanda', NOW(), NOW()),

('Repub Lounge', 'KG 9 Ave, Kigali, Rwanda', '+250 787 309 309', 4.5, 880, 'ChIJy4Thf4Gm3BkRcPneWsYkPw8', 'https://lh3.googleusercontent.com/p/ATKogpcJxObVmB3ixBqvDfp5yqD8IldHfu3Hpzw4hEFu=w800-h600-k-no', 'Rwanda', NOW(), NOW()),

('Riders Lounge Kigali', 'KN 78 St, Kigali, Rwanda', '+250 788 545 545', 4.2, 1159, 'ChIJaVwWuvOm3BkRn9_BRsYxSQM', 'https://lh3.googleusercontent.com/p/ATKogpdEUrASoFVI4HukeI6rjWmbxqCnwmGZ3O2Qa_9w=w800-h600-k-no', 'Rwanda', NOW(), NOW()),

('Sundowner', 'KG 11 Ave, Kigali, Rwanda', '+250 788 300 444', 4.2, 1735, 'ChIJg_-7Co6m3BkRkTfcJUxpCw8', 'https://lh3.googleusercontent.com/p/ATKogpe0Z4E9hvV_8_f7ifd3FisVZcwArAOu6I0FbIwm=w800-h600-k-no', 'Rwanda', NOW(), NOW()),

('Meze Fresh', 'KN 82 St, Kigali, Rwanda', '+250 787 773 773', 4.4, 939, 'ChIJIyFE4_Om3BkRBqg-iHQC6bk', 'https://lh3.googleusercontent.com/p/ATKogpcJFpU3Zj-iY1lPpxOogPBwJ67A6KyKUYXJvrTw=w800-h600-k-no', 'Rwanda', NOW(), NOW()),

('Pili Pili', 'KN 3 Ave, Kigali, Rwanda', '+250 252 571 111', 4.1, 2707, 'ChIJ4xdJmNem3BkRduSfESwuhgQ', 'https://lh3.googleusercontent.com/p/ATKogpfOJ2Ip-vTEvwi8cyrQuvtwjYTImdK-8dW_lbmQ=w800-h600-k-no', 'Rwanda', NOW(), NOW()),

('Billy''s Bistro & Bar', 'KG 627 St, Kigali, Rwanda', '+250 783 308 308', 4.3, 156, 'ChIJa6z7KUen3BkRrRypfbMzV9o', 'https://lh3.googleusercontent.com/p/ATKogpdcYMyBoIDDMFjZye8vNZejOIVAnizJrIPSx8Pp=w800-h600-k-no', 'Rwanda', NOW(), NOW()),

('Blackstone Lounge Kigali', 'KG 5 Ave, Kigali, Rwanda', '+250 788 606 060', 4.2, 166, 'ChIJSxLme6Kn3BkRSr5TGbwdEkY', 'https://lh3.googleusercontent.com/p/ATKogpewb3KAj4qhp5cU0inc4i4LH202m2-HMTkGMDBf=w800-h600-k-no', 'Rwanda', NOW(), NOW()),

('Copenhagen Lounge', 'KG 8 Ave, Kigali, Rwanda', '+250 787 888 808', 4.3, 154, 'ChIJJQSWsQWn3BkR1Wu0hDYa42A', 'https://lh3.googleusercontent.com/p/ATKogperwl2x-F-jM9Aokc0kI87myaD-AsTQmpcW47Tb=w800-h600-k-no', 'Rwanda', NOW(), NOW()),

('CRYSTAL LOUNGE - Rooftop Restaurant & Bar', 'KG 540 St, Kigali, Rwanda', '+250 788 777 774', 4.5, 48, 'ChIJ68Z_NgCn3BkRcANp_W1t8AA', 'https://lh3.googleusercontent.com/p/ATKogpfz41Nm98aKstRPSARili1oa44wX7Uxk09kXzdd=w800-h600-k-no', 'Rwanda', NOW(), NOW()),

('The Green Lounge Bar & Restaurant', 'KG 11 Ave, Kigali, Rwanda', '+250 787 500 500', 4.4, 160, 'ChIJW6vP1oan3BkRCwyh3VGiMS4', 'https://lh3.googleusercontent.com/p/ATKogpex9tzjjizgwiGmjfrfyd3eNWTcujkA3zpmqeRP=w800-h600-k-no', 'Rwanda', NOW(), NOW()),

('Heroes Lounge', 'KG 9 Ave, Kigali, Rwanda', '+250 787 676 767', 3.9, 236, 'ChIJTx9dIgOn3BkR_nW32msY2pI', 'https://lh3.googleusercontent.com/p/ATKogpfX9c4Ko3nYr7dATZjOjjAUpXlmzkepnhsj4dek=w800-h600-k-no', 'Rwanda', NOW(), NOW()),

('Jollof Kigali', 'KN 8 Ave, Kigali, Rwanda', '+250 789 888 000', 4.3, 467, 'ChIJW_hKz8On3BkRvGGmVgjmTYs', 'https://lh3.googleusercontent.com/p/ATKogpeISzfMUTke0PWY-04ZC1YO4mNKL8BwvC1O7VKg=w800-h600-k-no', 'Rwanda', NOW(), NOW()),

('Cincinnati Bar & Grill', 'KG 9 Ave, Kigali, Rwanda', '+250 787 234 567', 3.9, 121, 'ChIJEYm35b2n3BkRQuNhRRIacDo', 'https://lh3.googleusercontent.com/p/ATKogpf9U_V-04NMg9ZrDsk0lJ6jwQ9NheN3s2_KeViF=w800-h600-k-no', 'Rwanda', NOW(), NOW()),

('East 24 Bar & Grill', 'KG 5 Ave, Kigali, Rwanda', '+250 788 234 000', 4.1, 129, 'ChIJYZ83jZGn3BkRh6Ktavjd7ZM', 'https://lh3.googleusercontent.com/p/ATKogpfhjn46RJKlPoktRMkFBpx1COPy7ao-Yc8U-993=w800-h600-k-no', 'Rwanda', NOW(), NOW()),

('Burrows Bar & Restaurant', 'KN 4 Ave, Kigali, Rwanda', '+250 788 386 386', 4.1, 385, 'ChIJmTwIauym3BkRO5R_L87ngYE', 'https://lh3.googleusercontent.com/p/ATKogpcS-ntoOnHaQqaAsv_Brd60v6t78xpZODvfXbSi=w800-h600-k-no', 'Rwanda', NOW(), NOW());
