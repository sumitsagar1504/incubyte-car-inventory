import {test,expect} from '@playwright/test';
test('guest can browse, filter and save a model-specific vehicle',async({page})=>{
  await page.goto('/');
  await expect(page.getByRole('heading',{name:'Available inventory'})).toBeVisible();
  await expect(page.locator('.vehicle-card').first()).toBeVisible();
  const porsche=page.locator('.vehicle-card').filter({hasText:'911 Carrera'});
  await expect(porsche.locator('img')).toHaveAttribute('src',/porsche-911-carrera/);
  await porsche.getByRole('button',{name:'Save'}).click();
  await page.getByRole('link',{name:/Favorites/}).click();
  await expect(page.getByRole('heading',{name:'Favorite vehicles'})).toBeVisible();
  await expect(page.getByRole('link',{name:'911 Carrera'})).toBeVisible();
  await page.getByRole('link',{name:'911 Carrera'}).click();
  await expect(page.getByRole('heading',{name:'Porsche 911 Carrera'})).toBeVisible();
  await expect(page.locator('.gallery-thumbs button')).toHaveCount(2);
  await page.getByRole('button',{name:'Show photo 2'}).click();
  await expect(page.locator('.gallery-main img')).toHaveAttribute('src',/porsche-911-carrera-angle/);
  await expect(page.getByRole('link',{name:'Review reservation'})).toHaveAttribute('href',/login/);
});
test('mobile filters stay usable',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/');
  await page.getByRole('button',{name:/Filters/}).click();
  await page.getByRole('checkbox',{name:'In stock only'}).click();
  await expect(page).toHaveURL(/inStock=true/);
  await expect(page.locator('.vehicle-card').filter({hasText:'Volvo XC90'})).toHaveCount(0);
  await page.getByRole('button',{name:'Clear all'}).click();
  await expect(page).not.toHaveURL(/inStock=true/);
});
