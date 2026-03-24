// Internationalization Types for Dealock
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
    buyers: string
    match: string
    pipeline: string
    activities: string
    mandates: string
    settings: string
    logout: string
    finance: string
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
    sections: {
      urgent_now: string
      important_today: string
      strategic_opportunities: string
      blockers: string
      ready_resources: string
      recent_activity: string
    }
    labels: {
      items_requiring_action: string
      schedule_time: string
      high_value_matches: string
      issues_preventing: string
      buyers_cleared: string
      view_all: string
      closing: string
      urgent: string
      ready: string
      excellent_match: string
      contact_buyer: string
      review_opportunity: string
      no_urgent: string
      no_matches: string
      browse_match: string
      no_blockers: string
      no_ready_buyers: string
    }
  }
  
  // Leads / Sellers List
  leads: {
    title: string
    subtitle: string
    search_placeholder: string
    stats: {
      total: string
      critical: string
      near_mandate: string
      proposal_out: string
      signed: string
    }
    priorities: {
      critical_now: string
      high_priority: string
      developing: string
      nurture: string
    }
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
    back_to: string
    edit: string
    refresh_analysis: string
    property_value: string
    mandate_readiness: string
    beds: string
  }
  
  // Lead / Seller Detail
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
      mandate_status: string
      seller_profile: string
      notes: string
    }
    actions: {
      analyze_lead: string
      call: string
      email: string
      whatsapp: string
      schedule_meeting: string
      propose_mandate: string
      move_to_pipeline: string
      update_mandate: string
      follow_up: string
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
    mandate: {
      no_mandate: string
      ready_to_propose: string
      continue_building: string
      type: string
      exclusive: string
      non_exclusive: string
      propose: string
      activation_strategy: string
    }
  }
  
  // Buyers List
  buyers: {
    title: string
    subtitle: string
    search_placeholder: string
    stats: {
      total: string
      ready: string
      urgent: string
      committed: string
      blocked: string
    }
    priorities: {
      urgent: string
      high_priority: string
      active: string
      nurture: string
    }
    columns: {
      name: string
      criteria: string
      budget: string
      timeline: string
      status: string
    }
    actions: {
      view: string
      edit: string
      delete: string
    }
    back_to: string
    edit_profile: string
    budget_range: string
    finance_readiness: string
    timeline_label: string
    targeting: string
    cash_buyer: string
    pre_approved: string
    pre_approved_badge: string
    no_finance_profile: string
    find_matches: string
    suggested_message: string
    copy_message: string
    next_action: string
    mark_complete: string
    contact_info: string
    qualification_profile: string
  }
  
  // Buyer Detail
  buyer: {
    seriousness: {
      browsing: string
      interested: string
      serious: string
      committed: string
    }
    timeline: {
      browsing: string
      three_months: string
      one_month: string
      immediate: string
    }
    badges: {
      new: string
      contacted: string
      qualified: string
      viewing_scheduled: string
      offer_pending: string
      closed: string
      inactive: string
    }
  }
  
  // Edit Drawers
  edit: {
    seller_title: string
    buyer_title: string
    sections: {
      contact: string
      property: string
      mandate_context: string
      situation: string
      notes: string
      search_criteria: string
      budget: string
      timeline: string
      finance: string
    }
    fields: {
      owner_name: string
      name: string
      phone: string
      email: string
      language: string
      seller_type: string
      property_type: string
      city: string
      neighborhood: string
      area: string
      bedrooms: string
      price: string
      status: string
      source: string
      listing_url: string
      seller_profile: string
      internal_notes: string
      property_types: string
      target_areas: string
      min_bedrooms: string
      min_area: string
      budget_min: string
      budget_max: string
      timeline_label: string
      seriousness: string
      buyer_type: string
      annual_income: string
      down_payment: string
      monthly_debt: string
    }
    hints: {
      source: string
      listing_url: string
      seller_profile: string
      internal_notes: string
      property_types: string
      target_areas: string
    }
    toggles: {
      cash_buyer: string
      pre_approved: string
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
  
  // Import
  import: {
    title: string
    subtitle: string
    phaseLabel: string
    steps: {
      upload: string
      preview: string
      validate: string
      results: string
    }
    upload: {
      title: string
      description: string
      selectFile: string
      limits: string
    }
    template: {
      required: string
      requiredDesc: string
      optional: string
      optionalDesc: string
    }
    preview: {
      title: string
      rows: string
      mapping: string
      ignore: string
      dataPreview: string
      showingFirst: string
      missingRequired: string
      missingRequiredDesc: string
      validate: string
    }
    validate: {
      title: string
      readyToImport: string
      total: string
      valid: string
      invalid: string
      duplicates: string
      errors: string
      downloadErrors: string
      row: string
      data: string
      error: string
      andMore: string
      import: string
      importing: string
    }
    results: {
      success: string
      imported: string
      skipped: string
      duplicates: string
      importMore: string
      viewSellers: string
    }
    errors: {
      csvOnly: string
      fileTooLarge: string
      tooManyRows: string
      parseFailed: string
    }
    validation: {
      missingIdentifier: string
      missingContact: string
      invalidEmail: string
      invalidPhone: string
      duplicateInFile: string
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
    back: string
    save_changes: string
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
