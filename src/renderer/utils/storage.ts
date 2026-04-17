export const setStorage = (key: string, value: any) => {
  try {
    // 将对象转换为JSON字符串
    if (typeof value === 'object' && value !== null) {
        value = JSON.stringify(value);
    }

    // 存储数据
    window.localStorage.setItem(key, value);
  } catch (error) {
    console.error('Failed to set item in localStorage:', error);
    throw error;
  }
}

export const getStorage = (key: string) => {
  try {
    // 从localStorage中获取数据
    const item = window.localStorage.getItem(key);

    // 如果数据是JSON字符串，则转换为对象
    if (item && typeof item === 'string' && item.startsWith('{') && item.endsWith('}')) {
        try {
            return JSON.parse(item);
        } catch (error) {
            console.error('Failed to parse item from localStorage:', error);
            return null;
        }
    }

    // 返回原始数据
    return item;
  } catch (error) {
      console.error('Failed to get item from localStorage:', error);
      return null;
  }
}

export const removeStorage = (key: string) => {
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
      console.error('Failed to remove item from localStorage:', error);
      throw error;
  }
}

export const clearStorage = () => {
  try {
    window.localStorage.clear();
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
    throw error;
  }
}