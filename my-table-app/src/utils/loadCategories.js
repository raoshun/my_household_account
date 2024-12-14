import categories from '../config/categories.yml';

export default function loadCategories () {
  try {
    return categories.categories;
  } catch (e) {
    console.log(e);
    return [];
  }
};
