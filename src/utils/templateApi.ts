import type {
  PrintTemplate,
  PrintTemplateSection,
  PrintTemplateField,
  PrintTemplateColumn,
  PrintTemplateCustomField
} from './settingsData';

// ============================================================================
// CONFIGURATION: Set USE_BACKEND to true to connect to a real server!
// ============================================================================
export const USE_BACKEND = false; 
export const API_BASE_URL = 'http://localhost:5000/api'; // Replace with your backend URL
export const COMPANY_ID = 'co2'; // Replace with dynamic company/tenant ID if applicable

interface SyncData {
  templates: PrintTemplate[];
  sections: PrintTemplateSection[];
  fields: PrintTemplateField[];
  columns: PrintTemplateColumn[];
  customFields: PrintTemplateCustomField[];
}

/**
 * Loads all print template datasets from the backend server.
 * Fallbacks to localStorage if backend is disabled or fetch fails.
 */
export async function loadTemplatesFromApi(): Promise<SyncData | null> {
  if (!USE_BACKEND) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/print-templates/sync?company_id=${COMPANY_ID}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch from server: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      templates: data.templates || [],
      sections: data.sections || [],
      fields: data.fields || [],
      columns: data.columns || [],
      customFields: data.customFields || data.custom_fields || []
    };
  } catch (error) {
    console.warn("Backend load failed, falling back to localStorage:", error);
    return null;
  }
}

/**
 * Saves a single dataset type (or full sync) to the backend server.
 * This is designed to be called in background or when changes are made.
 */
export async function saveTemplatesToApi(type: keyof SyncData, payload: any): Promise<boolean> {
  if (!USE_BACKEND) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/print-templates/save-dataset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        company_id: COMPANY_ID,
        dataset_type: type,
        data: payload
      })
    });

    return response.ok;
  } catch (error) {
    console.error(`Failed to save dataset ${type} to backend:`, error);
    return false;
  }
}

/**
 * Alternative Endpoint: Save a single template with all its nested layout details.
 * Call this when a user clicks "Save layout" inside the template designer.
 */
export async function saveSingleTemplateLayout(
  template: PrintTemplate,
  sections: PrintTemplateSection[],
  fields: PrintTemplateField[],
  columns: PrintTemplateColumn[],
  customFields: PrintTemplateCustomField[]
): Promise<boolean> {
  if (!USE_BACKEND) return false;

  const payload = {
    company_id: COMPANY_ID,
    template_id: template.template_id,
    template: template,
    sections: sections.filter(s => s.template_id === template.template_id),
    fields: fields.filter(f => f.template_id === template.template_id),
    columns: columns.filter(c => c.template_id === template.template_id),
    custom_fields: customFields.filter(cf => cf.template_id === template.template_id)
  };

  try {
    const response = await fetch(`${API_BASE_URL}/print-templates/save-layout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }
    return true;
  } catch (error) {
    console.error("Failed to save template layout to backend:", error);
    return false;
  }
}
