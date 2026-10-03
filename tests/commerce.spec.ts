import { expect, test } from "@playwright/test";
import { expectBag, ready } from "./helpers";

test.describe("producto y bolsa", () => {
  test("variantes, validación de talle, cantidad, bolsa y persistencia", async ({ page }) => {
    await page.goto("/product/hartwell-signature-oxford");
    await ready(page);
    await expectBag(page, 0);

    // Sin talle: error inline sereno, nada se agrega
    await page.getByRole("button", { name: /Agregar/ }).first().click();
    await expect(page.getByRole("alert").filter({ hasText: "Elegir un talle para agregar a la bolsa." })).toBeVisible();
    await expectBag(page, 0);

    // Color: actualiza URL y galería
    await page.locator("label:has(input[name=color][value=chalk])").click();
    await expect(page).toHaveURL(/color=chalk/);
    await expect(page.getByText("Color: Chalk")).toBeVisible();
    await expect(page.locator("img[alt*='en Chalk']").first()).toBeAttached();

    // Talle agotado deshabilitado (chalk XS en el mock)
    await expect(page.getByRole("radio", { name: /^XS/ })).toBeDisabled();

    await page.locator("label:has(input[name=size][value='L'])").click();
    await expect(page.locator("#size-status")).toContainText("talle L");
    await page.getByRole("group", { name: "Cantidad" }).getByRole("button", { name: "Sumar uno" }).click();
    await expect(page.getByRole("group", { name: "Cantidad" }).locator("output")).toHaveText("2");

    await page.getByRole("button", { name: /Agregar/ }).first().click();
    await expectBag(page, 2);

    // Confirmación discreta desde el header
    const notice = page.getByTestId("bag-notice");
    await expect(notice).toBeVisible();
    await expect(notice).toContainText("Hartwell Signature Oxford");
    await notice.getByRole("button", { name: "Ver la bolsa" }).click();

    // Drawer: línea, variantes, subtotal
    const drawer = page.getByRole("dialog", { name: /La bolsa/ });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByText("Chalk · Talle L")).toBeVisible();
    await expect(drawer.getByText("US$ 290").first()).toBeVisible();

    // Stepper y quitar con deshacer
    await drawer.getByRole("button", { name: "Restar uno" }).click();
    await expect(drawer.getByText("Subtotal").locator("..")).toContainText("US$ 145");
    await drawer.getByRole("button", { name: /Quitar/ }).click();
    await expect(drawer).toContainText("La bolsa está vacía.");
    await drawer.getByRole("button", { name: /Deshacer/ }).click();
    await expect(drawer.getByText("Chalk · Talle L")).toBeVisible();

    // Persistencia tras recargar
    await page.keyboard.press("Escape");
    await expect(drawer).toBeHidden();
    await page.reload();
    await ready(page);
    await expectBag(page, 1);
  });

  test("talle único: se agrega sin elegir talle", async ({ page }) => {
    await page.goto("/product/hartwell-cap?color=forest");
    await ready(page);
    await expect(page.getByText("Talle único").first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Guía de talles" })).toHaveCount(0);
    await page.getByRole("button", { name: /Agregar/ }).first().click();
    await expectBag(page, 1);
    await page.locator("#bag-button").click();
    await expect(page.getByRole("dialog", { name: /La bolsa/ }).getByText("Forest · Talle único")).toBeVisible();
  });

  test("guía de talles: diálogo accesible", async ({ page }) => {
    await page.goto("/product/pleated-flannel-trouser");
    await ready(page);
    await page.getByRole("button", { name: "Guía de talles" }).click();
    const dialog = page.getByRole("dialog", { name: /Guía de talles/ });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("columnheader", { name: "Cintura" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("checkout simulado completo con validación", async ({ page }) => {
    await page.goto("/product/country-chino-trouser?color=navy");
    await ready(page);
    await page.locator("label:has(input[name=size][value='48'])").click();
    await page.getByRole("button", { name: /Agregar/ }).first().click();
    await expectBag(page, 1);

    await page.goto("/checkout");
    await ready(page);
    await expect(page.getByRole("heading", { name: "Checkout" })).toBeVisible();

    // Validación y foco en el primer error
    await page.getByRole("button", { name: "Continuar" }).click();
    await expect(page.getByText("El email no parece válido")).toBeVisible();
    await expect(page.locator("main").getByLabel("Email")).toHaveAttribute("aria-invalid", "true");
    await expect(page.locator("main").getByLabel("Email")).toBeFocused();

    await page.locator("main").getByLabel("Email").fill("clara@ashby.com");
    await page.getByLabel("Nombre y apellido").fill("Clara Ashby");
    await page.getByRole("button", { name: "Continuar" }).click();

    await expect(page.getByRole("heading", { name: "Envío" })).toBeVisible();
    await page.getByRole("button", { name: "Continuar" }).click();
    await expect(page.getByText("Falta la calle y el número.")).toBeVisible();
    await page.getByLabel("Dirección").fill("Av. Alvear 1891");
    await page.getByLabel("Ciudad").fill("Buenos Aires");
    await page.getByLabel("Código postal").fill("C1129");
    await page.getByLabel(/Preparar como regalo/).check();
    await page.getByRole("button", { name: "Continuar" }).click();

    await expect(page.getByRole("heading", { name: "Revisión" })).toBeVisible();
    await expect(page.getByText("Av. Alvear 1891")).toBeVisible();
    await expect(page.getByText("Preparado como regalo")).toBeVisible();
    await page.getByRole("button", { name: /Confirmar pedido · US\$ 177/ }).click();

    await expect(page).toHaveURL(/checkout\/success\?order=HW-/);
    await expect(page.getByRole("heading", { name: /Gracias, Clara/ })).toBeVisible();
    await expectBag(page, 0);
  });

  test("filtros del shop actualizan la lista y la URL", async ({ page, isMobile }) => {
    await page.goto("/shop");
    await ready(page);
    const count = page.getByText(/^\d+ piezas?$/);
    await expect(count).toHaveText("17 piezas");
    if (isMobile) await page.getByRole("button", { name: "Filtrar y ordenar" }).click();
    await page.getByRole("button", { name: "52", exact: true }).click();
    await expect(page).toHaveURL(/talle=52/);
    const n = Number((await count.textContent())!.split(" ")[0]);
    expect(n).toBeLessThan(17);
    await page.getByRole("button", { name: "Limpiar filtros" }).first().click();
    await expect(count).toHaveText("17 piezas");

    // Orden por precio
    await page.getByLabel("Ordenar").selectOption("price-desc");
    await expect(page).toHaveURL(/orden=price-desc/);
    await expect(page.locator("article h2").first()).toHaveText("Thornbury Camel Coat");

    // Filtro que llega por URL desde el servidor
    await page.goto("/shop?color=oxblood");
    await ready(page);
    await expect(page.getByText(/^\d+ piezas?$/)).toHaveText("2 piezas");
  });
});

test.describe("búsqueda", () => {
  test("panel: resultados al escribir y página completa con Enter", async ({ page }) => {
    await page.goto("/about");
    await ready(page);
    await page.getByRole("button", { name: "Buscar" }).click();
    const panel = page.getByRole("dialog", { name: "Buscar en HARTWELL" });
    await expect(panel).toBeVisible();
    const input = panel.getByLabel("Prenda, tela o color");
    await expect(input).toBeFocused();
    await input.fill("cashmere");
    await expect(panel.getByRole("link", { name: /Cashmere Crewneck/ })).toBeVisible();
    await input.press("Enter");
    await expect(page).toHaveURL(/\/search\?q=cashmere/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("cashmere");
    await expect(page.locator("article h2", { hasText: "Cashmere Crewneck" })).toBeVisible();
  });

  test("sinónimos en español y búsqueda sin resultados", async ({ page }) => {
    await page.goto("/search?q=cinturón");
    await ready(page);
    await expect(page.locator("article h2", { hasText: "Classic Leather Belt" })).toBeVisible();
    await page.goto("/search?q=snorkel");
    await ready(page);
    await expect(page.getByText("Ninguna pieza coincide")).toBeVisible();
    await expect(page.getByRole("link", { name: "Cashmere" })).toBeVisible();
  });
});

test.describe("quick add", () => {
  test("desktop: hover muestra talles y agrega", async ({ page, isMobile }) => {
    test.skip(isMobile, "solo puntero fino");
    await page.goto("/shop/polo");
    await ready(page);
    const card = page.locator("article").filter({ hasText: "Hartwell Classic Polo" });
    await card.hover();
    const size = card.getByRole("button", { name: "Agregar Hartwell Classic Polo, talle M" });
    await expect(size).toBeVisible();
    await size.click();
    await expectBag(page, 1);
  });

  test("mobile: el botón + abre la hoja de variantes", async ({ page, isMobile }) => {
    test.skip(!isMobile, "solo táctil");
    await page.goto("/shop/polo");
    await ready(page);
    await page.getByRole("button", { name: "Agregar Hartwell Classic Polo a la bolsa" }).click();
    const sheet = page.getByRole("dialog", { name: "Hartwell Classic Polo" });
    await expect(sheet).toBeVisible();
    await sheet.getByRole("button", { name: "Agregar a la bolsa" }).click();
    await expect(sheet.getByRole("alert")).toHaveText("Elegir un talle para agregar a la bolsa.");
    await sheet.locator("label:has(input[value='M'])").click();
    await sheet.getByRole("button", { name: "Agregar a la bolsa" }).click();
    await expect(sheet).toBeHidden();
    await expectBag(page, 1);
    await expect(page.getByTestId("bag-notice")).toBeVisible();
  });

  test("mobile: barra fija aparece al pasar el botón y pide talle", async ({ page, isMobile }) => {
    test.skip(!isMobile, "solo mobile");
    await page.goto("/product/regatta-linen-shirt");
    await ready(page);
    await page.evaluate(() => window.scrollTo(0, 1800));
    const bar = page.getByRole("button", { name: "Elegir talle" });
    await expect(bar).toBeVisible();
    await bar.click();
    await expect(page.getByRole("alert").filter({ hasText: "Elegir un talle para agregar a la bolsa." })).toBeVisible();
  });
});
