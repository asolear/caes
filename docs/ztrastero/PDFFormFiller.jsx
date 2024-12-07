// PDFFormFiller.js
import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Button, TextField, Select, MenuItem, Box } from '@mui/material';

const PDFFormFiller = () => {
  // Datos del formulario
  const camposFormulario = [
    { nombre: "ti", label: "ti", valorPorDefecto: 22 },
    { nombre: "te", label: "te", valorPorDefecto: 22 },
  ];

  const camposSelect = [
    { nombre: "h", label: "h", opciones: ['aa1', 'baaa2', 'aaab3'] },
  ];

  // Lista de campos calculados
  const camposCalculados = [
    { nombre: "tee", label: "tee", calculate: (data) => 44 },
    { nombre: "Textfield-0", label: "Textfield-0", calculate: (data) => calculos.calcularTe(data) },
  ];

  // Lista de funciones de cálculo
  const calculos = {
    calcularTe: (data) => (parseFloat(data.ti) * .1).toFixed(1),
  };

  const [formData, setFormData] = useState(
    camposFormulario.reduce((acc, campo) => ({ ...acc, [campo.nombre]: campo.valorPorDefecto }), {})
  );
  const [pdfData, setPdfData] = useState(null);

  // Manejar cambios en los campos de entrada
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Cargar PDF y loggear los nombres de los campos
  const loadPdf = async () => {
    const pdfUrl = '/fichas/agrario/AGR010.pdf';
    const existingPdfBytes = await fetch(pdfUrl).then((res) => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    const form = pdfDoc.getForm();
    form.getFields().forEach((field) => console.log(`Campo en PDF: ${field.getName()}`));

    return pdfDoc;
  };

  // Rellenar el PDF usando los valores de las listas
  const fillPdf = async () => {
    const pdfDoc = await loadPdf();
    const form = pdfDoc.getForm();
  
    // Obtener todos los campos del PDF para verificar si existen
    const existingFields = form.getFields().map(field => field.getName());
  
    // Rellenar campos de `camposFormulario`
    camposFormulario.forEach(({ nombre }) => {
      const field = form.getField(nombre);
      const value = formData[nombre];
      if (field && value !== undefined && value !== null) {
        field.setText(value.toString());
      } else {
        console.log(`Campo "${nombre}" no encontrado o tiene un valor inválido en el formulario.`);
      }
    });
  
    // Rellenar campos de `camposSelect`
    camposSelect.forEach(({ nombre }) => {
      const field = form.getField(nombre);
      const value = formData[nombre];
      if (field && value !== undefined && value !== null) {
        field.setText(value.toString());
      } else {
        console.log(`Campo "${nombre}" no encontrado o tiene un valor inválido en el formulario.`);
      }
    });
  
    // Calcular y rellenar campos de `camposCalculados`
    for (const { nombre, calculate } of camposCalculados) {
      // Verificar si el campo realmente existe
      if (!existingFields.includes(nombre)) {
        console.log(`Campo calculado "${nombre}" no existe en el PDF.`);
        continue; // Saltar a la siguiente iteración si no existe el campo
      }
  
      const value = calculate(formData); // Llamada a la función de cálculo
      const field = form.getField(nombre);
      if (field && value !== undefined && value !== null) {
        field.setText(String(value));
      } else {
        console.log(`Campo calculado "${nombre}" no encontrado o tiene un valor inválido en el PDF.`);
      }
    }
  
    const pdfBytes = await pdfDoc.save();
    setPdfData(pdfBytes);
  };
  
  const handleDownload = () => {
    if (!pdfData) return;

    const blob = new Blob([pdfData], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'filled_form.pdf';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: 300, margin: 'auto' }}>
      {/* Campos de entrada generados a partir de `camposFormulario` y `camposSelect` */}
      {camposFormulario.map(({ nombre, label }) => (
        <TextField
          key={nombre}
          label={label}
          name={nombre}
          variant="outlined"
          value={formData[nombre] || ''}
          onChange={handleInputChange}
        />
      ))}
      {camposSelect.map(({ nombre, label, opciones }) => (
        <Select
          key={nombre}
          label={label}
          name={nombre}
          value={formData[nombre] || ''}
          onChange={handleInputChange}
          displayEmpty
        >
          {opciones.map((opcion) => (
            <MenuItem key={opcion} value={opcion}>
              {opcion}
            </MenuItem>
          ))}
        </Select>
      ))}
      <Button variant="contained" onClick={fillPdf}>
        Fill PDF
      </Button>
      <Button variant="outlined" onClick={handleDownload} disabled={!pdfData}>
        Download PDF
      </Button>
    </Box>
  );
};

export default PDFFormFiller;
