import categories from '../config/categories.yml';

export default function loadCategories (categories) {
  try {
    return categories.categories;
  } catch (e) {
    console.log(e);
    return [];
  }
};
