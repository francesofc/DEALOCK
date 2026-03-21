-- MandateOS Seed Data
-- Run this after schema.sql to populate with demo data

-- Clear existing data (if any)
TRUNCATE TABLE mandates, ai_outputs, activities, leads CASCADE;

-- Insert Leads
INSERT INTO leads (
  id, owner_name, phone, whatsapp_status, source, listing_url, property_type, 
  neighborhood, city, price, area_m2, bedrooms, seller_type, language_preference,
  days_on_market_estimate, asking_vs_market_delta, photos_quality_score, 
  description_quality_score, priority_score, seller_profile, status, notes
) VALUES 
(
  '11111111-1111-1111-1111-111111111111',
  'Marie Dupont',
  '+33 6 12 34 56 78',
  'replied',
  'Referral',
  'https://example.com/listing/1',
  'Apartment',
  '6th Arrondissement',
  'Lyon',
  450000,
  85,
  3,
  'owner',
  'fr',
  15,
  -2.5,
  0.85,
  0.75,
  0.92,
  'Motivated seller, recently renovated kitchen, needs to sell within 60 days for job relocation. Open to exclusivity.',
  'mandate_signed',
  'Prefers communication via email during business hours. Has all documentation ready.'
),
(
  '22222222-2222-2222-2222-222222222222',
  'João Silva',
  '+351 912 345 678',
  'read',
  'Website',
  'https://example.com/listing/2',
  'Villa',
  'Cascais Centre',
  'Cascais',
  320000,
  120,
  4,
  'owner',
  'pt',
  45,
  5.0,
  0.70,
  0.60,
  0.78,
  'Family home, owners moving abroad. Some price flexibility. Interested in quick sale but not desperate.',
  'mandate_proposed',
  'Responded well to market analysis. Waiting for exclusivity proposal.'
),
(
  '33333333-3333-3333-3333-333333333333',
  'Emma Johnson',
  '+44 7700 900123',
  'delivered',
  'Social Media',
  'https://example.com/listing/3',
  'Studio',
  'Le Marais',
  'Paris',
  280000,
  28,
  0,
  'investor',
  'en',
  8,
  -8.0,
  0.90,
  0.80,
  0.85,
  'Investor selling after renovation. Price expectations realistic. Professional and responsive.',
  'call_scheduled',
  'Call scheduled for tomorrow 10 AM. Wants to discuss pricing strategy.'
),
(
  '44444444-4444-4444-4444-444444444444',
  'Carlos Mendes',
  '+351 923 456 789',
  'sent',
  'Email Campaign',
  'https://example.com/listing/4',
  'Apartment',
  'Chiado',
  'Lisbon',
  390000,
  65,
  2,
  'developer',
  'pt',
  120,
  12.0,
  0.55,
  0.45,
  0.62,
  'Developer with multiple units. Price is above market. Slow to respond. Low priority.',
  'replied',
  'Sent initial message. Auto-reply indicates out of office until next week.'
),
(
  '55555555-5555-5555-5555-555555555555',
  'Sophie Martin',
  '+33 6 98 76 54 32',
  'not_sent',
  'Referral',
  'https://example.com/listing/5',
  'House',
  'Chartrons',
  'Bordeaux',
  510000,
  140,
  4,
  'owner',
  'fr',
  30,
  0.0,
  0.80,
  0.85,
  0.88,
  'High-value property, motivated seller, divorce situation. Needs discretion and speed.',
  'qualified',
  'Referral from previous client. Very motivated, needs to sell within 90 days.'
),
(
  '66666666-6666-6666-6666-666666666666',
  'Lucas Pereira',
  '+351 934 567 890',
  'replied',
  'Website',
  'https://example.com/listing/6',
  'Apartment',
  'Alcântara',
  'Lisbon',
  245000,
  55,
  1,
  'owner',
  'pt',
  22,
  -3.0,
  0.75,
  0.70,
  0.82,
  'First-time seller, needs guidance through process. Responsive and friendly.',
  'contacted',
  'Initial contact made. Interested in learning about market conditions.'
),
(
  '77777777-7777-7777-7777-777777777777',
  'Ana Costa',
  '+351 945 678 901',
  'not_sent',
  'Walk-in',
  NULL,
  'Villa',
  'Estoril',
  'Cascais',
  580000,
  200,
  5,
  'owner',
  'pt',
  5,
  -5.0,
  0.88,
  0.60,
  0.90,
  'Luxury property, high expectations. Wants premium service and marketing.',
  'new',
  'Just added to system. Needs initial assessment and contact.'
),
(
  '88888888-8888-8888-8888-888888888888',
  'Pedro Santos',
  '+351 956 789 012',
  'read',
  'Portal',
  'https://example.com/listing/8',
  'Apartment',
  'Campo de Ourique',
  'Lisbon',
  420000,
  75,
  2,
  'investor',
  'pt',
  60,
  8.0,
  0.65,
  0.55,
  0.45,
  'Price too high, not flexible. Multiple agents already contacted.',
  'lost',
  'Decided to go with another agency. May re-engage in future.'
);

-- Insert Activities
INSERT INTO activities (lead_id, type, content, operator_name) VALUES
-- Marie Dupont activities
('11111111-1111-1111-1111-111111111111', 'lead', 'Lead created from referral by Jean Martin', 'System'),
('11111111-1111-1111-1111-111111111111', 'email', 'Sent market analysis and comparable sales', 'John Doe'),
('11111111-1111-1111-1111-111111111111', 'call', 'Discovery call - discussed timeline and motivation', 'John Doe'),
('11111111-1111-1111-1111-111111111111', 'meeting', 'Property visit and condition assessment', 'John Doe'),
('11111111-1111-1111-1111-111111111111', 'mandate', 'Exclusive mandate signed for 6 months', 'John Doe'),

-- João Silva activities
('22222222-2222-2222-2222-222222222222', 'lead', 'Lead created from website inquiry', 'System'),
('22222222-2222-2222-2222-222222222222', 'whatsapp', 'Initial WhatsApp message sent with market analysis', 'John Doe'),
('22222222-2222-2222-2222-222222222222', 'call', 'Follow-up call - discussed pricing expectations', 'John Doe'),
('22222222-2222-2222-2222-222222222222', 'email', 'Sent exclusivity proposal with marketing plan', 'John Doe'),

-- Emma Johnson activities
('33333333-3333-3333-3333-333333333333', 'lead', 'Lead created from Instagram ad', 'System'),
('33333333-3333-3333-3333-333333333333', 'email', 'Sent introduction and credentials', 'John Doe'),
('33333333-3333-3333-3333-333333333333', 'call', 'Scheduled for tomorrow - pricing discussion', 'John Doe'),

-- Carlos Mendes activities
('44444444-4444-4444-4444-444444444444', 'lead', 'Lead from email campaign #3', 'System'),
('44444444-4444-4444-4444-444444444444', 'email', 'Initial outreach sent', 'John Doe'),
('44444444-4444-4444-4444-444444444444', 'note', 'Auto-reply: out of office until next week', 'System'),

-- Sophie Martin activities
('55555555-5555-5555-5555-555555555555', 'lead', 'Referral from Marie Dupont', 'System'),
('55555555-5555-5555-5555-555555555555', 'call', 'Initial consultation - explained situation', 'John Doe'),
('55555555-5555-5555-5555-555555555555', 'note', 'Requires discretion due to divorce proceedings', 'John Doe'),

-- Other activities
('66666666-6666-6666-6666-666666666666', 'lead', 'Website inquiry - first-time seller', 'System'),
('66666666-6666-6666-6666-666666666666', 'whatsapp', 'Sent welcome message and process overview', 'John Doe'),
('77777777-7777-7777-7777-777777777777', 'lead', 'Walk-in prospect at office', 'System'),
('88888888-8888-8888-8888-888888888888', 'lead', 'Portal lead - already talking to other agents', 'System'),
('88888888-8888-8888-8888-888888888888', 'note', 'Lead lost - chose competitor', 'John Doe');

-- Insert Mandates
INSERT INTO mandates (lead_id, agency_name, exclusive, signing_mode, status, signed_at, notes) VALUES
('11111111-1111-1111-1111-111111111111', 'Premium Real Estate Lyon', true, 'electronic', 'signed', '2024-03-15T10:30:00Z', '6-month exclusive mandate. Full marketing package included.'),
('22222222-2222-2222-2222-222222222222', 'Premium Real Estate Cascais', true, 'physical', 'sent', NULL, 'Waiting for client to sign and return. Proposed 6 months exclusive.'),
('33333333-3333-3333-3333-333333333333', 'Premium Real Estate Paris', false, 'electronic', 'draft', NULL, 'Non-exclusive option prepared. Client prefers flexibility.'),
('88888888-8888-8888-8888-888888888888', 'Premium Real Estate Lisbon', true, 'electronic', 'expired', '2024-01-15T14:00:00Z', 'Mandate expired. Client did not renew, went with competitor.');

-- Insert AI Outputs (example for Marie Dupont)
INSERT INTO ai_outputs (
  lead_id, recommended_language, angle, 
  message_initial_fr, message_initial_pt, message_initial_en,
  voice_script_fr, voice_script_pt, voice_script_en,
  followup_d2_fr, followup_d2_pt, followup_d2_en,
  followup_d5_fr, followup_d5_pt, followup_d5_en,
  exclusivity_push_fr, exclusivity_push_pt, exclusivity_push_en,
  qualification_questions_fr, qualification_questions_pt, qualification_questions_en,
  objections_json, next_best_action
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'fr',
  'Relocation urgency - professional transition',
  
  -- Initial messages
  'Bonjour Marie, je suis John de Premium Real Estate. Jean m''a parlé de votre projet de vente à Lyon. Le marché est très dynamique actuellement. Puis-je vous proposer une analyse personnalisée de votre bien ?',
  'Olá Marie, sou o John da Premium Real Estate. O Jean falou-me do seu projeto de venda em Lyon. O mercado está muito dinâmico atualmente. Posso propor-lhe uma análise personalizada do seu imóvel?',
  'Hello Marie, I''m John from Premium Real Estate. Jean mentioned your sale project in Lyon. The market is very dynamic right now. May I offer you a personalized analysis of your property?',
  
  -- Voice scripts
  'Bonjour Marie, merci pour votre temps. Je comprends que votre déménagement professionnel crée une certaine urgence. Mon rôle est de vous accompagner pour vendre dans les meilleures conditions et délais. Parlons de votre appartement...',
  'Olá Marie, obrigado pelo seu tempo. Compreendo que a sua mudança profissional cria alguma urgência. O meu papel é acompanhá-la para vender nas melhores condições e prazos. Falemos do seu apartamento...',
  'Hello Marie, thank you for your time. I understand your job relocation creates some urgency. My role is to guide you to sell in the best conditions and timeframe. Let''s talk about your apartment...',
  
  -- Day 2 follow-ups
  'Bonjour Marie, suite à notre échange, j''ai préparé une analyse comparative détaillée. Les biens similaires se vendent en moyenne en 45 jours. Votre appartement, avec sa cuisine rénovée, a un avantage compétitif.',
  'Olá Marie, após a nossa conversa, preparei uma análise comparativa detalhada. Imóveis similares vendem-se em média em 45 dias. O seu apartamento, com a cozinha renovada, tem uma vantagem competitiva.',
  'Hello Marie, following our conversation, I''ve prepared a detailed comparative analysis. Similar properties sell on average in 45 days. Your apartment, with its renovated kitchen, has a competitive advantage.',
  
  -- Day 5 follow-ups
  'Bonjour Marie, un acheteur sérieux cherche actuellement dans votre quartier. Avec une exclusivité, je pourrais prioriser votre bien et organiser des visites dès cette semaine. Cela correspond à votre timeline ?',
  'Olá Marie, um comprador sério procura atualmente na sua zona. Com uma exclusividade, podia priorizar o seu imóvel e organizar visitas já esta semana. Corresponde à sua timeline?',
  'Hello Marie, a serious buyer is currently looking in your neighborhood. With exclusivity, I could prioritize your property and arrange viewings as early as this week. Does this match your timeline?',
  
  -- Exclusivity pushes
  'Avec 15 jours de présence sur le marché et votre motivation élevée, une exclusivité de 6 mois me permettrait de : 1) Prioriser votre bien, 2) Investir en marketing premium, 3) Cibler les acheteurs qualifiés, 4) Vendre dans vos 60 jours.',
  'Com 15 dias de presença no mercado e a sua motivação elevada, uma exclusividade de 6 meses permitir-me-ia: 1) Priorizar o seu imóvel, 2) Investir em marketing premium, 3) Segmentar compradores qualificados, 4) Vender nos seus 60 dias.',
  'With 15 days on the market and your high motivation, a 6-month exclusivity would allow me to: 1) Prioritize your property, 2) Invest in premium marketing, 3) Target qualified buyers, 4) Sell within your 60-day timeline.',
  
  -- Qualification questions
  ARRAY['Quelle est votre deadline ferme pour la vente ?', 'Avez-vous déjà acheté votre prochain logement ?', 'Le logement est-il vacant ou occupé ?'],
  ARRAY['Qual é o prazo firme para a venda ?', 'Já comprou a sua próxima habitação ?', 'O imóvel está vago ou ocupado ?'],
  ARRAY['What is your firm deadline for the sale?', 'Have you already purchased your next home?', 'Is the property vacant or occupied?'],
  
  -- Objections
  '{"price": "Le marché actuel justifie ce prix avec la rénovation", "delai": "Notre stratégie marketing cible les acheteurs actifs", "exclusivite": "L''exclusivité garantit priorité et investissement"}'::jsonb,
  
  -- Next best action
  'Propose exclusivity agreement with premium marketing package. Schedule signing meeting.'
);
