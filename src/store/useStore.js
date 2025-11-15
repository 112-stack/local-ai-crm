import { create } from 'zustand'

export const useStore = create((set) => ({
  // Applicants
  applicants: [],
  addApplicant: (applicant) => set((state) => ({
    applicants: [...state.applicants, { ...applicant, id: Date.now() }]
  })),
  updateApplicant: (id, data) => set((state) => ({
    applicants: state.applicants.map(a => a.id === id ? { ...a, ...data } : a)
  })),
  removeApplicant: (id) => set((state) => ({
    applicants: state.applicants.filter(a => a.id !== id)
  })),

  // Events
  events: [],
  addEvent: (event) => set((state) => ({
    events: [...state.events, { ...event, id: Date.now() }]
  })),
  updateEvent: (id, data) => set((state) => ({
    events: state.events.map(e => e.id === id ? { ...e, ...data } : e)
  })),
  removeEvent: (id) => set((state) => ({
    events: state.events.filter(e => e.id !== id)
  })),

  // Weddings
  weddings: [],
  addWedding: (wedding) => set((state) => ({
    weddings: [...state.weddings, { ...wedding, id: Date.now() }]
  })),
  updateWedding: (id, data) => set((state) => ({
    weddings: state.weddings.map(w => w.id === id ? { ...w, ...data } : w)
  })),
  removeWedding: (id) => set((state) => ({
    weddings: state.weddings.filter(w => w.id !== id)
  })),

  // Predictions
  predictions: [],
  addPrediction: (prediction) => set((state) => ({
    predictions: [...state.predictions, { ...prediction, id: Date.now() }]
  })),

  // Settings
  settings: {
    useLocalGPU: true,
    useOpenAI: false,
    openAIKey: '',
    modelType: 'local'
  },
  updateSettings: (settings) => set((state) => ({
    settings: { ...state.settings, ...settings }
  })),
}))
