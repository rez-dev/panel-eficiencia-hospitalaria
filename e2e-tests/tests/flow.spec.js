const { test, expect } = require('@playwright/test');
const { config } = require('../config/urls.js');

test.describe('Panel de Análisis de Eficiencia Técnica Hospitalaria', () => {
test('Revisar informaciones', async ({ page }) => {
    // 1. Ir a la página principal
    await page.goto('/');

    // 2. Buscar y hacer click en la opción "Info" del navbar (usando class ant-menu-title-content)
    const infoNavButton = page.locator('.ant-menu-title-content', { hasText: 'Info' });
    await expect(infoNavButton.first()).toBeVisible({ timeout: 5000 });
    await infoNavButton.first().click();

    // 3. Verificar que el título del contenido sea "Información acerca del panel"
    const tituloInfo = page.locator('h1:has-text("Información acerca del panel"), h2:has-text("Información acerca del panel"), h3:has-text("Información acerca del panel"), [data-testid="titulo-info"]');
    await expect(tituloInfo).toBeVisible({ timeout: 10000 });

    // 4. Presionar la sección "Fuente de datos" del sider (usando class ant-menu-title-content)
    // Esperar a que el sider esté visible
    const siderMenu = page.locator('.ant-layout-sider, .ant-menu, .ant-menu-root').filter({ has: page.locator('.ant-menu-title-content') });
    await expect(siderMenu.first()).toBeVisible({ timeout: 5000 });
    // Buscar el item visible con el texto "Fuente de datos" dentro del sider
    const fuenteDatosSider = siderMenu.locator('.ant-menu-title-content', { hasText: /Fuentes de datos/i }).first();
    await expect(fuenteDatosSider).toBeVisible({ timeout: 5000 });
    await fuenteDatosSider.click();

    // 5. Verificar que el contenido contenga texto con "Fuentes de Datos" como título
    const tituloFuentes = page.locator('h1:has-text("Fuentes de Datos"), h2:has-text("Fuentes de Datos"), h3:has-text("Fuentes de Datos"), [data-testid="titulo-fuentes"]');
    await expect(tituloFuentes).toBeVisible({ timeout: 10000 });

    // console.log('✅ Test completado: Navegación a Info y verificación de sección Fuente de datos');
});
test('Calcular PCA y clusterización', async ({ page }) => {
    // 1. Ir a la página principal
    await page.goto('/');

    // 2. Buscar y hacer click en la opción "PCA & Cluster" del navbar (usando class ant-menu-title-content)
    const pcaNavButton = page.locator('.ant-menu-title-content', { hasText: 'PCA & Clúster' });
    await expect(pcaNavButton.first()).toBeVisible({ timeout: 5000 });
    await pcaNavButton.first().click();

    // 3. Verificar que el título del contenido sea "Análisis de componentes y clusterización"
    const tituloPCA = page.locator('h1:has-text("Análisis de componentes y clusterización"), h2:has-text("Análisis de componentes y clusterización"), h3:has-text("Análisis de componentes y clusterización"), [data-testid="titulo-pca"]');
    await expect(tituloPCA).toBeVisible({ timeout: 10000 });

    // 4. Seleccionar el año 2017 (busca select visible con año y opción 2017)
    const yearSelect = page.locator('.ant-select-selector').filter({ hasText: /20\d{2}/ }).first();
    await expect(yearSelect).toBeVisible({ timeout: 5000 });
    await yearSelect.click();
    const option2017 = page.locator('.ant-select-item-option-content:has-text("2017")');
    await expect(option2017).toBeVisible({ timeout: 5000 });
    await option2017.click();

    // 5. Ingresar el número 3 en el input de N de clústeres
    // Busca un input numérico relacionado a clústeres (por placeholder, aria-label, label, etc.)
    let clusterInput = page.locator('input[placeholder*="clúster" i], input[aria-label*="clúster" i], input');
    // Si hay más de uno, intenta filtrar por cercanía a un label
    if (await clusterInput.count() > 1) {
        // Busca un label cercano
        const labelCluster = page.locator('label:has-text("clúster")');
        if (await labelCluster.count() > 0) {
            const labelFor = await labelCluster.first().getAttribute('for');
            if (labelFor) {
                clusterInput = page.locator(`#${labelFor}`);
            }
        } else {
            clusterInput = clusterInput.nth(1); // fallback: segundo input
        }
    }
    await expect(clusterInput).toBeVisible({ timeout: 5000 });
    await clusterInput.fill('3');

    // 6. Presionar el botón Calcular
    const calcularButton = page.locator('button[type="primary"]:has-text("Calcular"), button.ant-btn-primary:has-text("Calcular")').first();
    await expect(calcularButton).toBeVisible({ timeout: 5000 });
    await calcularButton.click();

    // 7. Verificar que la tabla tenga datos tras calcular
    // Busca celdas de tabla visibles y con texto
    const tableCells = page.locator('.ant-table-cell, .ant-table-cell.ant-table-cell-ellipsis');
    await expect(tableCells.first()).toBeVisible({ timeout: 20000 });
    const cellsWithText = tableCells.filter({ hasText: /.+/ });
    await expect(cellsWithText.first()).toBeVisible();
    const cellsCount = await cellsWithText.count();
    expect(cellsCount).toBeGreaterThan(0);

    // console.log('✅ Test completado: PCA & Cluster, selección de año, N de clústeres, cálculo y verificación de tabla con datos');
});
test('Analizar determinantes', async ({ page }) => {
    // 1. Ir a la página principal
    await page.goto('/');

    // 2. Hacer click en "Comenzar Análisis"
    const comenzarButton = page.locator('button:has-text("Comenzar Análisis"), button:has-text("Comenzar análisis"), button:has-text("COMENZAR ANÁLISIS")');
    await expect(comenzarButton).toBeVisible();
    await comenzarButton.click();

    // 3. Esperar a que aparezca la vista de eficiencia
    const tituloEficiencia = page.locator('h1:has-text("Eficiencia técnica hospitalaria"), h2:has-text("Eficiencia técnica hospitalaria"), h3:has-text("Eficiencia técnica hospitalaria")');
    await expect(tituloEficiencia).toBeVisible({ timeout: 10000 });

    // 4. Seleccionar metodología SFA (Radio.Button en el header)
    const sfaRadioButton = page.locator('label:has-text("SFA"), [role="radio"][value="SFA"], .ant-radio-button-wrapper:has-text("SFA")');
    await expect(sfaRadioButton.first()).toBeVisible({ timeout: 5000 });
    await sfaRadioButton.first().click();

    // 5. Cambiar el año a 2016 (Select en el header)
    const yearSelect = page.locator('.ant-select-selector').filter({ hasText: /20\d{2}/ }).first();
    await expect(yearSelect).toBeVisible({ timeout: 5000 });
    await yearSelect.click();
    const option2016 = page.locator('.ant-select-item-option-content:has-text("2016")');
    await expect(option2016).toBeVisible({ timeout: 5000 });
    await option2016.click();

    // 5.1 Seleccionar "Dias de cama disponibles" en el primer select del sidebar (Entradas)
    const sidebar = page.locator('text=Parámetros de Cálculo').locator('..');
    const entradasSelect = sidebar.locator('.ant-select-selector').nth(0);
    await expect(entradasSelect).toBeVisible({ timeout: 5000 });
    await entradasSelect.click();
    const entradasDropdown = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').first();
    await expect(entradasDropdown).toBeVisible({ timeout: 5000 });
    const diasCamaOption = entradasDropdown.locator('.ant-select-item-option[title="Días de cama disponibles"]');
    await expect(diasCamaOption).toBeVisible({ timeout: 5000 });
    await diasCamaOption.click();
    await page.keyboard.press('Escape');

    // 5.2 Seleccionar "Exámenes" en el segundo select del sidebar (Salidas)
    const salidasSelect = sidebar.locator('.ant-select-selector').nth(1);
    await expect(salidasSelect).toBeVisible({ timeout: 5000 });
    await salidasSelect.click();
    const salidasDropdown = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').first();
    await expect(salidasDropdown).toBeVisible({ timeout: 5000 });
    const examenesOption = salidasDropdown.locator('.ant-select-item-option-content:has-text("Exámenes")');
    await expect(examenesOption).toBeVisible({ timeout: 5000 });
    await examenesOption.click();
    await page.keyboard.press('Escape');

    // 6. Hacer click en el botón "Calcular" del sidebar
    const calcularButton = page.locator('button[type="primary"]:has-text("Calcular"), button.ant-btn-primary:has-text("Calcular")');
    await expect(calcularButton).toBeVisible({ timeout: 5000 });
    await calcularButton.click();

    // 7. Verificar que la tabla tenga datos
    const tableCells = page.locator('.ant-table-cell.ant-table-cell-ellipsis');
    await expect(tableCells.first()).toBeVisible({ timeout: 20000 });
    const cellsWithText = page.locator('.ant-table-cell.ant-table-cell-ellipsis').filter({ hasText: /.+/ });
    await expect(cellsWithText.first()).toBeVisible();
    const cellsCount = await cellsWithText.count();
    expect(cellsCount).toBeGreaterThan(0);

    // 8. Presionar el botón "Analizar determinantes"
    const analizarDeterminantesButton = page.locator('button:has-text("Analizar determinantes")');
    await expect(analizarDeterminantesButton).toBeVisible({ timeout: 5000 });
    await analizarDeterminantesButton.click();

    // 9. Verificar que aparece el título "Análisis de determinantes de eficiencia" en la vista de determinantes
    const tituloDeterminantes = page.locator('h1:has-text("Análisis de determinantes de eficiencia"), h2:has-text("Análisis de determinantes de eficiencia"), h3:has-text("Análisis de determinantes de eficiencia"), [data-testid="titulo-determinantes"]');
    await expect(tituloDeterminantes).toBeVisible({ timeout: 10000 });

    // 10. Presionar el botón "Calcular" en la vista de determinantes
    const calcularDeterminantesButton = page.locator('button[type="primary"]:has-text("Calcular"), button.ant-btn-primary:has-text("Calcular")').first();
    await expect(calcularDeterminantesButton).toBeVisible({ timeout: 5000 });
    await calcularDeterminantesButton.click();

    // 11. Verificar que la tabla tenga datos tras calcular determinantes (más robusto)
    let tablaDeterminantesCells = page.locator('.ant-table-cell');
    let cellsWithTextDeterminantes = tablaDeterminantesCells.filter({ hasText: /.+/ });
    let cellsCountDeterminantes = 0;
    try {
        await expect(tablaDeterminantesCells.first()).toBeVisible({ timeout: 20000 });
        await expect(cellsWithTextDeterminantes.first()).toBeVisible();
        cellsCountDeterminantes = await cellsWithTextDeterminantes.count();
    } catch (e) {
        // Si no encuentra celdas, mostrar advertencia
        console.warn('No se encontraron celdas con ".ant-table-cell" tras calcular determinantes.');
    }
    expect(cellsCountDeterminantes).toBeGreaterThan(0);

    // console.log('✅ Test completado: Calcular SFA, analizar determinantes y calcular determinantes');
});    
test('Comparación entre distintos hospitales ', async ({ page }) => {
    // 1. Ir a la página principal
    await page.goto('/');

    // 2. Hacer click en "Comenzar Análisis"
    const comenzarButton = page.locator('button:has-text("Comenzar Análisis"), button:has-text("Comenzar análisis"), button:has-text("COMENZAR ANÁLISIS")');
    await expect(comenzarButton).toBeVisible();
    await comenzarButton.click();

    // 3. Esperar a que aparezca la vista de eficiencia
    const tituloEficiencia = page.locator('h1:has-text("Eficiencia técnica hospitalaria"), h2:has-text("Eficiencia técnica hospitalaria"), h3:has-text("Eficiencia técnica hospitalaria")');
    await expect(tituloEficiencia).toBeVisible({ timeout: 10000 });

    // 4. Seleccionar metodología SFA (Radio.Button en el header)
    const sfaRadioButton = page.locator('label:has-text("SFA"), [role="radio"][value="SFA"], .ant-radio-button-wrapper:has-text("SFA")');
    await expect(sfaRadioButton.first()).toBeVisible({ timeout: 5000 });
    await sfaRadioButton.first().click();

    // 5. Cambiar el año a 2016 (Select en el header)
    const yearSelect = page.locator('.ant-select-selector').filter({ hasText: /20\d{2}/ }).first();
    await expect(yearSelect).toBeVisible({ timeout: 5000 });
    await yearSelect.click();
    const option2016 = page.locator('.ant-select-item-option-content:has-text("2016")');
    await expect(option2016).toBeVisible({ timeout: 5000 });
    await option2016.click();

    // 5.1 Seleccionar "Dias de cama disponibles" en el primer select del sidebar (Entradas)
    const sidebar = page.locator('text=Parámetros de Cálculo').locator('..');
    const entradasSelect = sidebar.locator('.ant-select-selector').nth(0);
    await expect(entradasSelect).toBeVisible({ timeout: 5000 });
    await entradasSelect.click();
    const entradasDropdown = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').first();
    await expect(entradasDropdown).toBeVisible({ timeout: 5000 });
    const diasCamaOption = entradasDropdown.locator('.ant-select-item-option[title="Días de cama disponibles"]');
    await expect(diasCamaOption).toBeVisible({ timeout: 5000 });
    await diasCamaOption.click();
    await page.keyboard.press('Escape');

    // 5.2 Seleccionar "Exámenes" en el segundo select del sidebar (Salidas)
    const salidasSelect = sidebar.locator('.ant-select-selector').nth(1);
    await expect(salidasSelect).toBeVisible({ timeout: 5000 });
    await salidasSelect.click();
    const salidasDropdown = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').first();
    await expect(salidasDropdown).toBeVisible({ timeout: 5000 });
    const examenesOption = salidasDropdown.locator('.ant-select-item-option-content:has-text("Exámenes")');
    await expect(examenesOption).toBeVisible({ timeout: 5000 });
    await examenesOption.click();
    await page.keyboard.press('Escape');

    // 6. Hacer click en el botón "Calcular" del sidebar
    const calcularButton = page.locator('button[type="primary"]:has-text("Calcular"), button.ant-btn-primary:has-text("Calcular")');
    await expect(calcularButton).toBeVisible({ timeout: 5000 });
    await calcularButton.click();

    // 7. Verificar que la tabla tenga datos
    const tableRows = page.locator('.ant-table-row');
    await expect(tableRows.first()).toBeVisible({ timeout: 20000 });
    const rowCount = await tableRows.count();
    expect(rowCount).toBeGreaterThan(1);

    // 8. Obtener los nombres de los dos primeros hospitales
    const firstRow = tableRows.nth(0);
    const secondRow = tableRows.nth(1);
    const firstHospitalNameCell = firstRow.locator('.ant-table-cell').filter({ hasText: /hospital|Hospital|HOSPITAL/ }).first();
    const secondHospitalNameCell = secondRow.locator('.ant-table-cell').filter({ hasText: /hospital|Hospital|HOSPITAL/ }).first();
    let firstHospitalName = '';
    let secondHospitalName = '';
    if (await firstHospitalNameCell.count() > 0) {
        firstHospitalName = (await firstHospitalNameCell.textContent()).trim();
    } else {
        firstHospitalName = (await firstRow.locator('.ant-table-cell').nth(1).textContent()).trim();
    }
    if (await secondHospitalNameCell.count() > 0) {
        secondHospitalName = (await secondHospitalNameCell.textContent()).trim();
    } else {
        secondHospitalName = (await secondRow.locator('.ant-table-cell').nth(1).textContent()).trim();
    }
    // console.log('Primer hospital seleccionado:', firstHospitalName);
    // console.log('Segundo hospital seleccionado:', secondHospitalName);

    // 9. Hacer check en el primer y segundo hospital
    const firstCheckbox = firstRow.locator('.ant-checkbox-input').first();
    const secondCheckbox = secondRow.locator('.ant-checkbox-input').first();
    await expect(firstCheckbox).toBeVisible({ timeout: 5000 });
    await expect(secondCheckbox).toBeVisible({ timeout: 5000 });
    await firstCheckbox.check();
    await secondCheckbox.check();

    // 10. Presionar el botón "Comparar hospital"
    const compararButton = page.locator('button:has-text("Comparar hospital")');
    await expect(compararButton).toBeVisible({ timeout: 5000 });
    await compararButton.click();

    // 11. Verificar que aparece el contenido con el título "Comparación hospitalaria"
    const comparacionTitulo = page.locator('h1:has-text("Comparación hospitalaria"), h2:has-text("Comparación hospitalaria"), h3:has-text("Comparación hospitalaria"), [data-testid="titulo-comparacion"]');
    await expect(comparacionTitulo).toBeVisible({ timeout: 10000 });

    // 12. Verificar que ambos nombres aparecen en las cards de comparación
    const cardBodies = page.locator('.ant-card-body');
    await expect(cardBodies.first()).toBeVisible({ timeout: 5000 });
    const cardCount = await cardBodies.count();
    let foundFirst = false;
    let foundSecond = false;
    for (let i = 0; i < cardCount; i++) {
        const card = cardBodies.nth(i);
        const cardText = (await card.textContent() || '').toLowerCase();
        if (cardText.includes(firstHospitalName.toLowerCase())) {
            foundFirst = true;
            // console.log('Primer hospital encontrado en card:', firstHospitalName);
        }
        if (cardText.includes(secondHospitalName.toLowerCase())) {
            foundSecond = true;
            // console.log('Segundo hospital encontrado en card:', secondHospitalName);
        }
    }
    if (!foundFirst) {
        console.warn('No se encontró el primer hospital en las cards de comparación. Nombre buscado:', firstHospitalName);
    }
    if (!foundSecond) {
        console.warn('No se encontró el segundo hospital en las cards de comparación. Nombre buscado:', secondHospitalName);
    }
    expect(foundFirst).toBe(true);
    expect(foundSecond).toBe(true);

    // console.log('✅ Test completado: Comparación de dos hospitales y verificación de ambos nombres en las cards');
});
test('Comparación del mismo hospital en distintos períodos', async ({ page }) => {
    // 1. Ir a la página principal
    await page.goto('/');

    // 2. Hacer click en "Comenzar Análisis"
    const comenzarButton = page.locator('button:has-text("Comenzar Análisis"), button:has-text("Comenzar análisis"), button:has-text("COMENZAR ANÁLISIS")');
    await expect(comenzarButton).toBeVisible();
    await comenzarButton.click();

    // 3. Esperar a que aparezca la vista de eficiencia
    const tituloEficiencia = page.locator('h1:has-text("Eficiencia técnica hospitalaria"), h2:has-text("Eficiencia técnica hospitalaria"), h3:has-text("Eficiencia técnica hospitalaria")');
    await expect(tituloEficiencia).toBeVisible({ timeout: 10000 });

    // 4. Seleccionar metodología SFA (Radio.Button en el header)
    const sfaRadioButton = page.locator('label:has-text("SFA"), [role="radio"][value="SFA"], .ant-radio-button-wrapper:has-text("SFA")');
    await expect(sfaRadioButton.first()).toBeVisible({ timeout: 5000 });
    await sfaRadioButton.first().click();

    // 5. Cambiar el año a 2016 (Select en el header) - selector más robusto
    const yearSelect = page.locator('.ant-select-selector').filter({ hasText: /20\d{2}/ }).first();
    await expect(yearSelect).toBeVisible({ timeout: 5000 });
    await yearSelect.click();

    // Esperar a que aparezca el dropdown y seleccionar 2016
    const option2016 = page.locator('.ant-select-item-option-content:has-text("2016")');
    await expect(option2016).toBeVisible({ timeout: 5000 });
    await option2016.click();

    // 5.1 Seleccionar "Dias de cama disponibles" en el primer select del sidebar (Entradas)
    const sidebar = page.locator('text=Parámetros de Cálculo').locator('..');
    const entradasSelect = sidebar.locator('.ant-select-selector').nth(0);
    await expect(entradasSelect).toBeVisible({ timeout: 5000 });
    await entradasSelect.click();
    // Esperar a que el primer dropdown visible esté disponible y seleccionar la opción
    const entradasDropdown = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').first();
    await expect(entradasDropdown).toBeVisible({ timeout: 5000 });
    const diasCamaOption = entradasDropdown.locator('.ant-select-item-option[title="Días de cama disponibles"]');
    await expect(diasCamaOption).toBeVisible({ timeout: 5000 });
    await diasCamaOption.click();
    // Cerrar el dropdown para evitar que tape los siguientes botones
    await page.keyboard.press('Escape');

    // 5.2 Seleccionar "Exámenes" en el segundo select del sidebar (Salidas)
    const salidasSelect = sidebar.locator('.ant-select-selector').nth(1);
    await expect(salidasSelect).toBeVisible({ timeout: 5000 });
    await salidasSelect.click();
    // Esperar a que el primer dropdown visible esté disponible y seleccionar la opción
    const salidasDropdown = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').first();
    await expect(salidasDropdown).toBeVisible({ timeout: 5000 });
    const examenesOption = salidasDropdown.locator('.ant-select-item-option-content:has-text("Exámenes")');
    await expect(examenesOption).toBeVisible({ timeout: 5000 });
    await examenesOption.click();
    // Cerrar el dropdown para evitar que tape los siguientes botones
    await page.keyboard.press('Escape');

    // 6. Hacer click en el botón "Calcular" del sidebar
    const calcularButton = page.locator('button[type="primary"]:has-text("Calcular"), button.ant-btn-primary:has-text("Calcular")');
    await expect(calcularButton).toBeVisible({ timeout: 5000 });
    await calcularButton.click();

    // 7. Verificar que la tabla tenga datos (filas con información de hospitales)
    const tableCells = page.locator('.ant-table-cell.ant-table-cell-ellipsis');
    await expect(tableCells.first()).toBeVisible({ timeout: 20000 });
    const cellsWithText = page.locator('.ant-table-cell.ant-table-cell-ellipsis').filter({ hasText: /.+/ });
    await expect(cellsWithText.first()).toBeVisible();
    const cellsCount = await cellsWithText.count();
    expect(cellsCount).toBeGreaterThan(0);
    const hospitalCell = page.locator('.ant-table-cell').filter({ hasText: /hospital|Hospital|HOSPITAL/ }).first();
    await expect(hospitalCell).toBeVisible({ timeout: 5000 });

    // 8. Hacer check en el primer hospital de la tabla
    // Obtener el nombre del primer hospital antes de hacer check
    const firstRow = page.locator('.ant-table-row').first();
    // Busca la celda que contiene el nombre del hospital en la primera fila
    const firstHospitalNameCell = firstRow.locator('.ant-table-cell').filter({ hasText: /hospital|Hospital|HOSPITAL/ }).first();
    let selectedHospitalName = '';
    if (await firstHospitalNameCell.count() > 0) {
        selectedHospitalName = await firstHospitalNameCell.textContent();
        selectedHospitalName = selectedHospitalName.trim();
    } else {
        // Si no se encuentra por filtro, tomar la segunda celda de la fila (asumiendo nombre en la segunda columna)
        selectedHospitalName = (await firstRow.locator('.ant-table-cell').nth(1).textContent()).trim();
    }
    // console.log('Nombre de hospital seleccionado:', selectedHospitalName);
    // Busca el primer checkbox de la tabla y haz click
    const firstCheckbox = firstRow.locator('.ant-checkbox-input').first();
    await expect(firstCheckbox).toBeVisible({ timeout: 5000 });
    await firstCheckbox.check();

    // 9. Presionar el botón "Comparar hospital"
    const compararButton = page.locator('button:has-text("Comparar hospital")');
    await expect(compararButton).toBeVisible({ timeout: 5000 });
    await compararButton.click();

    // 10. Verificar que aparece el contenido con el título "Comparación hospitalaria"
    const comparacionTitulo = page.locator('h1:has-text("Comparación hospitalaria"), h2:has-text("Comparación hospitalaria"), h3:has-text("Comparación hospitalaria"), [data-testid="titulo-comparacion"]');
    await expect(comparacionTitulo).toBeVisible({ timeout: 10000 });

    // 11. Verificar que el nombre mostrado es el mismo que el seleccionado
    // Buscar el nombre del hospital solo dentro de la card de comparación
    const cardBody = page.locator('.ant-card-body');
    await expect(cardBody.first()).toBeVisible({ timeout: 5000 });
    const comparacionNombreCandidates = cardBody.locator('h1, h2, h3, span, div, p, td, th');
    const candidateCount = await comparacionNombreCandidates.count();
    let found = false;
    let comparacionNombreText = '';
    for (let i = 0; i < candidateCount; i++) {
        const el = comparacionNombreCandidates.nth(i);
        const text = (await el.textContent() || '').trim();
        if (text && text.toLowerCase().includes(selectedHospitalName.toLowerCase())) {
            comparacionNombreText = text;
            found = true;
            // Print de control
            // console.log('Nombre encontrado en comparación (en .ant-card-body):', comparacionNombreText);
            break;
        }
    }
    if (!found) {
        console.warn('No se encontró el nombre del hospital en la card de comparación. Nombre buscado:', selectedHospitalName);
    }
    expect(found).toBe(true);

    // console.log('✅ Test completado: Selección, comparación y verificación de título y nombre de hospital tras SFA');
});
test('Calcular eficiencia DEA-M', async ({ page }) => {
    // 1. Ir a la página principal
    await page.goto('/');

    // 2. Hacer click en "Comenzar Análisis"
    const comenzarButton = page.locator('button:has-text("Comenzar Análisis"), button:has-text("Comenzar análisis"), button:has-text("COMENZAR ANÁLISIS")');
    await expect(comenzarButton).toBeVisible();
    await comenzarButton.click();

    // 3. Esperar a que aparezca la vista de eficiencia
    const tituloEficiencia = page.locator('h1:has-text("Eficiencia técnica hospitalaria"), h2:has-text("Eficiencia técnica hospitalaria"), h3:has-text("Eficiencia técnica hospitalaria")');
    await expect(tituloEficiencia).toBeVisible({ timeout: 10000 });

    // 4. Seleccionar metodología DEA-M (Radio.Button en el header)
    const deamRadioButton = page.locator('label:has-text("DEA-M"), [role="radio"][value="DEA-M"], .ant-radio-button-wrapper:has-text("DEA-M")');
    await expect(deamRadioButton.first()).toBeVisible({ timeout: 5000 });
    await deamRadioButton.first().click();

    // 5. Seleccionar "Remuneraciones" en Variable Top (último select del sidebar)
    const sidebar = page.locator('text=Parámetros de Cálculo').locator('..');
    const selects = sidebar.locator('.ant-select-selector');
    const count = await selects.count();
    const variableTopSelect = selects.nth(count - 1);
    await expect(variableTopSelect).toBeVisible({ timeout: 5000 });
    await variableTopSelect.click();
    // Esperar a que el primer dropdown visible esté disponible y seleccionar la opción
    const variableTopDropdown = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').first();
    await expect(variableTopDropdown).toBeVisible({ timeout: 5000 });
    const remuneracionesOption = variableTopDropdown.locator('.ant-select-item-option-content:has-text("Remuneraciones")');
    await expect(remuneracionesOption).toBeVisible({ timeout: 5000 });
    await remuneracionesOption.click();
    // Cerrar el dropdown para evitar que tape los siguientes botones
    await page.keyboard.press('Escape');

    // 6. Hacer click en el botón "Calcular" del sidebar
    const calcularButton = page.locator('button[type="primary"]:has-text("Calcular"), button.ant-btn-primary:has-text("Calcular")');
    await expect(calcularButton).toBeVisible({ timeout: 5000 });
    await calcularButton.click();

    // 7. Verificar que la tabla tenga datos (filas con información de hospitales)
    // Esperar a que aparezcan datos en la tabla
    const tableCells = page.locator('.ant-table-cell.ant-table-cell-ellipsis');
    await expect(tableCells.first()).toBeVisible({ timeout: 20000 });

    // Verificar que las celdas contengan texto (no estén vacías)
    const cellsWithText = page.locator('.ant-table-cell.ant-table-cell-ellipsis').filter({ hasText: /.+/ });
    await expect(cellsWithText.first()).toBeVisible();

    // Verificar que hay múltiples celdas con datos
    const cellsCount = await cellsWithText.count();
    expect(cellsCount).toBeGreaterThan(0);

    // Verificar que al menos una celda contiene datos específicos de hospitales
    const hospitalCell = page.locator('.ant-table-cell').filter({ hasText: /hospital|Hospital|HOSPITAL/ }).first();
    await expect(hospitalCell).toBeVisible({ timeout: 5000 });

    // console.log('✅ Test completado: Análisis DEA-M ejecutado exitosamente');
});
test('Calcular eficiencia DEA', async ({ page }) => {
    // 1. Ir a la página principal
    await page.goto('/');

    // 2. Hacer click en "Comenzar Análisis"
    const comenzarButton = page.locator('button:has-text("Comenzar Análisis"), button:has-text("Comenzar análisis"), button:has-text("COMENZAR ANÁLISIS")');
    await expect(comenzarButton).toBeVisible();
    await comenzarButton.click();

    // 3. Esperar a que aparezca la vista de eficiencia
    const tituloEficiencia = page.locator('h1:has-text("Eficiencia técnica hospitalaria"), h2:has-text("Eficiencia técnica hospitalaria"), h3:has-text("Eficiencia técnica hospitalaria")');
    await expect(tituloEficiencia).toBeVisible({ timeout: 10000 });

    // 4. Seleccionar metodología DEA (Radio.Button en el header)
    const deaRadioButton = page.locator('label:has-text("DEA"), [role="radio"][value="DEA"], .ant-radio-button-wrapper:has-text("DEA")');
    await expect(deaRadioButton.first()).toBeVisible({ timeout: 5000 });
    await deaRadioButton.first().click();

    // 5. Cambiar el año a 2016 (Select en el header) - selector más robusto
    const yearSelect = page.locator('.ant-select-selector').filter({ hasText: /20\d{2}/ }).first();
    await expect(yearSelect).toBeVisible({ timeout: 5000 });
    await yearSelect.click();

    // Esperar a que aparezca el dropdown y seleccionar 2016
    const option2016 = page.locator('.ant-select-item-option-content:has-text("2016")');
    await expect(option2016).toBeVisible({ timeout: 5000 });
    await option2016.click();

    // 5.1 Seleccionar "Dias de cama disponibles" en el primer select del sidebar (Entradas)
    const sidebar = page.locator('text=Parámetros de Cálculo').locator('..');
    const entradasSelect = sidebar.locator('.ant-select-selector').nth(0);
    await expect(entradasSelect).toBeVisible({ timeout: 5000 });
    await entradasSelect.click();
    // Esperar a que el primer dropdown visible esté disponible y seleccionar la opción
    const entradasDropdown = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').first();
    await expect(entradasDropdown).toBeVisible({ timeout: 5000 });
    const diasCamaOption = entradasDropdown.locator('.ant-select-item-option[title="Días de cama disponibles"]');
    await expect(diasCamaOption).toBeVisible({ timeout: 5000 });
    await diasCamaOption.click();
    // Cerrar el dropdown para evitar que tape los siguientes botones
    await page.keyboard.press('Escape');

    // 5.2 Seleccionar "Exámenes" en el segundo select del sidebar (Salidas)
    const salidasSelect = sidebar.locator('.ant-select-selector').nth(1);
    await expect(salidasSelect).toBeVisible({ timeout: 5000 });
    await salidasSelect.click();
    // Esperar a que el primer dropdown visible esté disponible y seleccionar la opción
    const salidasDropdown = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').first();
    await expect(salidasDropdown).toBeVisible({ timeout: 5000 });
    const examenesOption = salidasDropdown.locator('.ant-select-item-option-content:has-text("Exámenes")');
    await expect(examenesOption).toBeVisible({ timeout: 5000 });
    await examenesOption.click();
    // Cerrar el dropdown para evitar que tape los siguientes botones
    await page.keyboard.press('Escape');

    // 6. Hacer click en el botón "Calcular" del sidebar
    const calcularButton = page.locator('button[type="primary"]:has-text("Calcular"), button.ant-btn-primary:has-text("Calcular")');
    await expect(calcularButton).toBeVisible({ timeout: 5000 });
    await calcularButton.click();

    // 7. Verificar que la tabla tenga datos (filas con información de hospitales)
    // Esperar a que aparezcan datos en la tabla
    const tableCells = page.locator('.ant-table-cell.ant-table-cell-ellipsis');
    await expect(tableCells.first()).toBeVisible({ timeout: 20000 });

    // Verificar que las celdas contengan texto (no estén vacías)
    const cellsWithText = page.locator('.ant-table-cell.ant-table-cell-ellipsis').filter({ hasText: /.+/ });
    await expect(cellsWithText.first()).toBeVisible();

    // Verificar que hay múltiples celdas con datos
    const cellsCount = await cellsWithText.count();
    expect(cellsCount).toBeGreaterThan(0);

    // Verificar que al menos una celda contiene datos específicos de hospitales
    const hospitalCell = page.locator('.ant-table-cell').filter({ hasText: /hospital|Hospital|HOSPITAL/ }).first();
    await expect(hospitalCell).toBeVisible({ timeout: 5000 });

    // console.log('✅ Test completado: Análisis DEA 2016 ejecutado exitosamente');
});
test('Calcular eficiencia SFA', async ({ page }) => {
    // 1. Ir a la página principal
    await page.goto('/');

    // 2. Hacer click en "Comenzar Análisis"
    const comenzarButton = page.locator('button:has-text("Comenzar Análisis"), button:has-text("Comenzar análisis"), button:has-text("COMENZAR ANÁLISIS")');
    await expect(comenzarButton).toBeVisible();
    await comenzarButton.click();

    // 3. Esperar a que aparezca la vista de eficiencia
    const tituloEficiencia = page.locator('h1:has-text("Eficiencia técnica hospitalaria"), h2:has-text("Eficiencia técnica hospitalaria"), h3:has-text("Eficiencia técnica hospitalaria")');
    await expect(tituloEficiencia).toBeVisible({ timeout: 10000 });

    // 4. Seleccionar metodología SFA (Radio.Button en el header)
    const sfaRadioButton = page.locator('label:has-text("SFA"), [role="radio"][value="SFA"], .ant-radio-button-wrapper:has-text("SFA")');
    await expect(sfaRadioButton.first()).toBeVisible({ timeout: 5000 });
    await sfaRadioButton.first().click();

    // 5. Cambiar el año a 2016 (Select en el header) - selector más robusto
    const yearSelect = page.locator('.ant-select-selector').filter({ hasText: /20\d{2}/ }).first();
    await expect(yearSelect).toBeVisible({ timeout: 5000 });
    await yearSelect.click();

    // Esperar a que aparezca el dropdown y seleccionar 2016
    const option2016 = page.locator('.ant-select-item-option-content:has-text("2016")');
    await expect(option2016).toBeVisible({ timeout: 5000 });
    await option2016.click();

    // 5.1 Seleccionar "Dias de cama disponibles" en el primer select del sidebar (Entradas)
    const sidebar = page.locator('text=Parámetros de Cálculo').locator('..');
    const entradasSelect = sidebar.locator('.ant-select-selector').nth(0);
    await expect(entradasSelect).toBeVisible({ timeout: 5000 });
    await entradasSelect.click();
    // Esperar a que el primer dropdown visible esté disponible y seleccionar la opción
    const entradasDropdown = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').first();
    await expect(entradasDropdown).toBeVisible({ timeout: 5000 });
    const diasCamaOption = entradasDropdown.locator('.ant-select-item-option[title="Días de cama disponibles"]');
    await expect(diasCamaOption).toBeVisible({ timeout: 5000 });
    await diasCamaOption.click();
    // Cerrar el dropdown para evitar que tape los siguientes botones
    await page.keyboard.press('Escape');

    // 5.2 Seleccionar "Exámenes" en el segundo select del sidebar (Salidas)
    const salidasSelect = sidebar.locator('.ant-select-selector').nth(1);
    await expect(salidasSelect).toBeVisible({ timeout: 5000 });
    await salidasSelect.click();
    // Esperar a que el primer dropdown visible esté disponible y seleccionar la opción
    const salidasDropdown = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').first();
    await expect(salidasDropdown).toBeVisible({ timeout: 5000 });
    const examenesOption = salidasDropdown.locator('.ant-select-item-option-content:has-text("Exámenes")');
    await expect(examenesOption).toBeVisible({ timeout: 5000 });
    await examenesOption.click();
    // Cerrar el dropdown para evitar que tape los siguientes botones
    await page.keyboard.press('Escape');

    // 6. Hacer click en el botón "Calcular" del sidebar
    const calcularButton = page.locator('button[type="primary"]:has-text("Calcular"), button.ant-btn-primary:has-text("Calcular")');
    await expect(calcularButton).toBeVisible({ timeout: 5000 });
    await calcularButton.click();

    // 7. Verificar que la tabla tenga datos (filas con información de hospitales)
    // Esperar a que aparezcan datos en la tabla
    const tableCells = page.locator('.ant-table-cell.ant-table-cell-ellipsis');
    await expect(tableCells.first()).toBeVisible({ timeout: 20000 });

    // Verificar que las celdas contengan texto (no estén vacías)
    const cellsWithText = page.locator('.ant-table-cell.ant-table-cell-ellipsis').filter({ hasText: /.+/ });
    await expect(cellsWithText.first()).toBeVisible();

    // Verificar que hay múltiples celdas con datos
    const cellsCount = await cellsWithText.count();
    expect(cellsCount).toBeGreaterThan(0);

    // Verificar que al menos una celda contiene datos específicos de hospitales
    const hospitalCell = page.locator('.ant-table-cell').filter({ hasText: /hospital|Hospital|HOSPITAL/ }).first();
    await expect(hospitalCell).toBeVisible({ timeout: 5000 });

    // console.log('✅ Test completado: Análisis DEA 2016 ejecutado exitosamente');
});
test('Navegación de inicio a Comenzar Análisis', async ({ page }) => {
    // 1. Ir a la página principal
    await page.goto('/');
    
    // 2. Verificar que la página principal carga correctamente
    await expect(page.locator('body')).toBeVisible();
    
    // 3. Buscar y hacer click en el botón "Comenzar Análisis"
    const comenzarButton = page.locator('button:has-text("Comenzar Análisis"), button:has-text("Comenzar análisis"), button:has-text("COMENZAR ANÁLISIS")');
    await expect(comenzarButton).toBeVisible();
    await comenzarButton.click();
    
    // 4. Verificar que aparece el título "Eficiencia técnica hospitalaria" DENTRO del contenido de la página
    const tituloEficiencia = page.locator('h1:has-text("Eficiencia técnica hospitalaria"), h2:has-text("Eficiencia técnica hospitalaria"), h3:has-text("Eficiencia técnica hospitalaria"), [data-testid="titulo-eficiencia"]');
    await expect(tituloEficiencia).toBeVisible({ timeout: 10000 });
    
    // console.log('✅ Test completado: Navegación exitosa a vista de eficiencia');
  });
});
