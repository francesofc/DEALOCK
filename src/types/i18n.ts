// Internationalization Types for MandateOS
// Supports: English, French, Portuguese, Spanish
// Future-ready: Russian (planned)

export type Language = 'en' | 'fr' | 'pt' | 'es'

export const LANGUAGES: { code: Language; name: string; nativeName: string }[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
]

export interface TranslationDictionary {
  // Navigation
  nav: {
    dashboard: string
    leads: string
    pipeline: string
    activities: string
    mandates: string
    settings: string
    logout: string
  }
  
  // Command Center (Dashboard)
  command_center: {
    title: string
    subtitle: string
    today_focus: string
    priority_sellers: string
    needs_attention: string
    mandate_opportunities: string
    ai_signals: string
    next_best_actions: string
    metrics: {
      leads_attention: string
      mandate_opportunities: string
      exclusivity_candidates: string
      active_mandates: string
      stalled_deals: string
    }
  }
  
  // Leads
  leads: {
    title: string
    subtitle: string
    columns: {
      name: string
      property: string
      seller_profile: string
      next_move: string
      mandate_potential: string
      exclusivity_potential: string
      language: string
      status: string
    }
    actions: {
      analyze: string
      view: string
      edit: string
      delete: string
    }
    empty: {
      title: string
      description: string
      action: string
    }
  }
  
  // Lead Detail / Commercial Cockpit
  lead: {
    title: string
    commercial_cockpit: string
    back_to_leads: string
    sections: {
      property_details: string
      seller_intelligence: string
      mindset: string
      relationship: string
      momentum: string
      recommended_angle: string
      tone: string
      next_move: string
      what_to_avoid: string
      suggested_message: string
      suggested_timing: string
      ai_scripts: string
      activity_timeline: string
    }
    actions: {
      analyze_lead: string
      call: string
      email: string
      whatsapp: string
      schedule_meeting: string
      propose_mandate: string
      move_to_pipeline: string
    }
    badges: {
      new: string
      qualified: string
      contacted: string
      replied: string
      call_scheduled: string
      mandate_proposed: string
      mandate_sent: string
      mandate_signed: string
      lost: string
    }
  }
  
  // Pipeline
  pipeline: {
    title: string
    subtitle: string
    bottlenecks: {
      title: string
      stuck_deals: string
      waiting_too_long: string
      proposals_pending: string
    }
    stages: {
      new: string
      qualified: string
      contacted: string
      replied: string
      call_scheduled: string
      mandate_proposed: string
      mandate_sent: string
      mandate_signed: string
      lost: string
    }
  }
  
  // Mandates
  mandates: {
    title: string
    subtitle: string
    actions: {
      generate_strategy: string
      analyze_mandate: string
      new_mandate: string
    }
    sections: {
      expiring_soon: string
      at_risk: string
      needing_attention: string
      activation_strategy: {
        title: string
        listing_positioning: string
        go_to_market: string
        buyer_profile: string
        launch_strategy: string
      }
    }
    empty: {
      title: string
      description: string
    }
  }
  
  // Activities
  activities: {
    title: string
    subtitle: string
    types: {
      call: string
      email: string
      whatsapp: string
      meeting: string
      note: string
      mandate: string
      lead: string
    }
    empty: {
      title: string
      description: string
    }
  }
  
  // Settings
  settings: {
    title: string
    subtitle: string
    sections: {
      profile: string
      team: string
      ai: string
      business: string
      languages: string
      notifications: string
      diagnostics: string
    }
    languages: {
      title: string
      description: string
      interface_language: string
      supported_languages: string
      add_language: string
    }
  }
  
  // Common / UI
  common: {
    loading: string
    save: string
    cancel: string
    edit: string
    delete: string
    create: string
    search: string
    filter: string
    more: string
    view_all: string
    priority: string
    status: string
    actions: string
    not_available: string
    coming_soon: string
  }
}

// Language-aware lead content types
export interface MultilingualContent {
  language: Language
  content: string
}

export type LeadLanguageContent = {
  [key in Language]?: string
}
