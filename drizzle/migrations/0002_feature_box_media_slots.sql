INSERT INTO public.site_images (key, url, default_url, label, section) VALUES
('feature-box-genjutsu', '/__l5e/assets-v1/00fb0266-49dd-45e9-a657-356a4a44a2a9/genjutsu-performance.mp4', '/__l5e/assets-v1/00fb0266-49dd-45e9-a657-356a4a44a2a9/genjutsu-performance.mp4', 'Genjutsu · Perform Anywhere', 'feature_boxes'),
('feature-box-grwm', '/__l5e/assets-v1/c0b08c94-3f76-44f6-abcc-7e20b9843b78/grwm-mirror.webp', '/__l5e/assets-v1/c0b08c94-3f76-44f6-abcc-7e20b9843b78/grwm-mirror.webp', 'Get Ready With Me', 'feature_boxes'),
('feature-box-luxury', '/nav-previews/perform-anywhere.jpg', '/nav-previews/perform-anywhere.jpg', 'Luxury Interior', 'feature_boxes'),
('feature-box-colors', '/__l5e/assets-v1/51b17b65-7558-43b6-840a-dc91eeaa7402/landing-demo-reel.mp4', '/__l5e/assets-v1/51b17b65-7558-43b6-840a-dc91eeaa7402/landing-demo-reel.mp4', 'Colors Studio', 'feature_boxes'),
('feature-box-multiangle', '/nav-previews/avatar.jpg', '/nav-previews/avatar.jpg', 'Multi-Angle Camera', 'feature_boxes'),
('feature-box-tiktok30', '/__l5e/assets-v1/c328ce33-2593-4c18-b5b2-afef56622ca6/preview-2.mp4', '/__l5e/assets-v1/c328ce33-2593-4c18-b5b2-afef56622ca6/preview-2.mp4', 'TikTok30', 'feature_boxes'),
('feature-box-videoAgent', '/nav-previews/video-agent.jpg', '/nav-previews/video-agent.jpg', 'Video Agent', 'feature_boxes'),
('feature-box-puremix', '/nav-previews/music-video.jpg', '/nav-previews/music-video.jpg', 'PureMix Mastering', 'feature_boxes'),
('feature-box-soul', '/nav-previews/avatar.jpg', '/nav-previews/avatar.jpg', 'Soul Studio', 'feature_boxes'),
('feature-box-lipsync', '/__l5e/assets-v1/0b056a79-d7c1-4393-bef5-036389956cc0/balloon-lipsync-demo.mp4', '/__l5e/assets-v1/0b056a79-d7c1-4393-bef5-036389956cc0/balloon-lipsync-demo.mp4', 'Lip Sync Studio', 'feature_boxes')
ON CONFLICT (key) DO NOTHING;