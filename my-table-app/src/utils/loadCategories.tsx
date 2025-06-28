import yaml from 'js-yaml';

const loadCategories = async () => {
  try {
    const response = await fetch('/config/categories.yml');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const text = await response.text();
    const data = yaml.load(text); // safeload -> load に修正（最新版対応）
    
    if (!data || !data.categories) {
      console.warn('No categories found in the YAML file');
      return [];
    }
    
    return data.categories;
  } catch (e) {
    console.error('Error loading categories:', e);
    return [];
  }
};

export default loadCategories;
