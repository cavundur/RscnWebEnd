// src/utils/api.js - Legacy API module
// Yeni API modülüne yönlendirme yapıyor

import wpApi from '@/lib/api/wordpress';

// WordPress API endpoint
const API_URL = "https://example.com/wp-json/wp/v2";

// Örnek projeler (API çağrısı başarısız olursa kullanılacak)
const MOCK_PROJECTS = [
  {
    id: 1,
    title: { rendered: "VALUECARE" },
    excerpt: { rendered: "<p>ValueCare aims to deliver efficient outcome-based integrated care to older people facing cognitive impairment, frailty and multiple chronic health conditions.</p>" },
    content: { rendered: "<p>ValueCare aims to deliver efficient outcome-based integrated care to older people facing cognitive impairment, frailty and multiple chronic health conditions. The project's goal is to improve their quality of life (and of their families) as well as the sustainability of health and social care systems in Europe.</p><p>The project will achieve this by implementing the Value-Based approach, which is a new paradigm that shifts the focus from the volume of services delivered to the patient outcomes achieved.</p>" },
    featured_media_url: "/assets/images/valuecare-project.jpg"
  },
  {
    id: 2,
    title: { rendered: "REGIONS4PERMED" },
    excerpt: { rendered: "<p>Regions4PerMed is coordinating and supporting regional initiatives in implementing personalized medicine and fostering interregional cooperation.</p>" },
    content: { rendered: "<p>Regions4PerMed is coordinating and supporting regional initiatives in implementing personalized medicine and fostering interregional cooperation. The project brings together regional stakeholders to establish a structured interregional framework for sustained collaboration in personalized medicine research and implementation.</p><p>The project focuses on key innovation areas: Big Data & Electronic Health Records, Personalized Health Industry 4.0, Health Technology Assessment & Citizen Engagement, and Personalized Prevention.</p>" },
    featured_media_url: "/assets/images/regions4permed-project.jpg"
  },
  {
    id: 3,
    title: { rendered: "JADECARE" },
    excerpt: { rendered: "<p>JADECARE aims to transfer innovative practices for digitally-enabled integrated person-centered care models across European regions.</p>" },
    content: { rendered: "<p>JADECARE (Joint Action on implementation of Digitally Enabled integrated person-centered CARE) aims to transfer innovative practices for digitally-enabled integrated person-centered care models across European regions.</p><p>The project reinforces the capacity of health authorities to successfully address important aspects of health system transformation, particularly the transition to digitally-enabled, person-centered care aimed at achieving better outcomes for patients.</p>" },
    featured_media_url: "/assets/images/jadecare-project.jpg"
  }
];

/**
 * Fetch projects from WordPress API
 * @returns {Promise<Array>} Projects data
 */
export async function getProjects() {
  return wpApi.getProjects();
}

// Örnek etkinlikler (API çağrısı başarısız olursa kullanılacak)
const MOCK_EVENTS = [
  {
    id: 1,
    title: { rendered: "Annual RSCN Conference 2024" },
    excerpt: { rendered: "<p>Join us for the annual RSCN Conference focused on latest innovations in active and healthy aging across European regions.</p>" },
    content: { rendered: "<p>Join us for the annual RSCN Conference focused on latest innovations in active and healthy aging across European regions. The conference will feature keynote speakers, panel discussions, and interactive workshops.</p><p>This year's theme is 'Digital Solutions for Aging Populations' with special focus on telehealth, remote monitoring, and AI applications in geriatric care.</p>" },
    featured_media_url: "/assets/images/conference-event.jpg",
    date: "2024-10-15"
  },
  {
    id: 2,
    title: { rendered: "Webinar: Funding Opportunities for Health Innovation" },
    excerpt: { rendered: "<p>Learn about upcoming EU funding calls and grant opportunities for health innovation projects in 2024-2025.</p>" },
    content: { rendered: "<p>Learn about upcoming EU funding calls and grant opportunities for health innovation projects in 2024-2025. This webinar will cover Horizon Europe Health Cluster calls, Digital Europe Programme, and regional structural funds.</p><p>Our expert speakers will provide insights on proposal preparation, consortium building, and budget planning for successful applications.</p>" },
    featured_media_url: "/assets/images/webinar-event.jpg",
    date: "2024-06-22"
  },
  {
    id: 3,
    title: { rendered: "RSCN Working Group: Digital Health Integration" },
    excerpt: { rendered: "<p>The RSCN Digital Health Working Group is meeting to discuss best practices in integrating digital health tools into regional health systems.</p>" },
    content: { rendered: "<p>The RSCN Digital Health Working Group is meeting to discuss best practices in integrating digital health tools into regional health systems. This working group session will focus on interoperability standards, data governance, and deployment strategies.</p><p>Participants will share case studies from their regions and collaborate on developing common frameworks and guidelines for implementing digital health solutions.</p>" },
    featured_media_url: "/assets/images/working-group-event.jpg",
    date: "2024-08-05"
  }
];

/**
 * Fetch events from WordPress API
 * @returns {Promise<Array>} Events data
 */
export async function getEvents() {
  return wpApi.getEvents();
}

// Diğer API fonksiyonları buraya eklenebilir 