import * as dayjs from 'dayjs';

export const formatDateDirective = {
  mounted(el: any, binding: any) {
    // 获取绑定的日期和格式
    const dateValue = binding.value;
    console.log('dateValue: ', dateValue);
    const format = binding.arg || 'YYYY-MM-DD'; // 默认格式
    console.log('format: ', format);
 
    el.textContent = 'ADSF'
    // el.textContent = dayjs(dateValue).format(format);
  }
};