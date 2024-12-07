import React, { useState, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Button, TextField, Select, MenuItem, Box, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import pdfUrl from '../fichas/Agrario/AGR010.pdf';


const PDFFormFiller = () => {
    // Datos del formulario
    // const pdfUrl = '/fichas/agrario/AGR010.pdf';



    // Lista de funciones de cálculo
    const calculos = {
        calcularTe: (data) => (parseFloat(data.ti) * .1).toFixed(1),
    };

    const camposFormulario = [
        { nombre: "ti", label: "ti", valorPorDefecto: 22 },
        { nombre: "te", label: "te", valorPorDefecto: 22 },
    ];

    const camposSelect = [
        { nombre: "h", label: "h", opciones: ['aa1', 'baaa2', 'aaab3'], valorPorDefecto: 'baaa2' },
    ];

    // Lista de campos calculados
    const camposCalculados = [
        { nombre: "tee", label: "tee", calculate: (data) => 44 },
        { nombre: "Textfield-0", label: "Textfield-0", calculate: (data) => calculos.calcularTe(data) },
    ];


    /////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////


    const [formData, setFormData] = useState(
        camposFormulario.reduce((acc, campo) => ({ ...acc, [campo.nombre]: campo.valorPorDefecto }), {})
    );
    const [pdfData, setPdfData] = useState(null);
    const [openModal, setOpenModal] = useState(false); // Estado para controlar el modal

    // Manejar cambios en los campos de entrada
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            const newFormData = { ...prev, [name]: value };
            //   fillPdf(newFormData); // Llamar a la función fillPdf cada vez que haya un cambio
            return newFormData;
        });
    };

    // Cargar PDF y loggear los nombres de los campos
    const loadPdf = async () => {
        // const pdfUrl = '/fichas/agrario/AGR010.pdf';
        const existingPdfBytes = await fetch(pdfUrl).then((res) => res.arrayBuffer());
        const pdfDoc = await PDFDocument.load(existingPdfBytes);

        const form = pdfDoc.getForm();
        form.getFields().forEach((field) => console.log(`Campo en PDF: ${field.getName()}`));

        return pdfDoc;
    };

    // Rellenar el PDF usando los valores de las listas
    const fillPdf = async (newFormData) => {
        const pdfDoc = await loadPdf();
        const form = pdfDoc.getForm();

        // Obtener todos los campos del PDF para verificar si existen
        const existingFields = form.getFields().map(field => field.getName());

        // Rellenar campos de `camposFormulario`
        camposFormulario.forEach(({ nombre }) => {
            const field = form.getField(nombre);
            const value = newFormData[nombre];
            if (field && value !== undefined && value !== null) {
                field.setText(value.toString());
            } else {
                console.log(`Campo "${nombre}" no encontrado o tiene un valor inválido en el formulario.`);
            }
        });

        // Rellenar campos de `camposSelect`
        camposSelect.forEach(({ nombre }) => {
            const field = form.getField(nombre);
            const value = newFormData[nombre];
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

            const value = calculate(newFormData); // Llamada a la función de cálculo
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

    // Llamar a fillPdf al principio con los valores por defecto
    useEffect(() => {
        fillPdf(formData);
    }, []); // Solo se ejecuta una vez al inicio

    const handleOpenModal = () => setOpenModal(true);
    const handleCloseModal = () => setOpenModal(false);

    return (
        <>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', margin: 'auto' }}>
                {/* Botón para abrir el modal */}
                {/*                 
                <Button variant="outlined" onClick={handleOpenModal}>
                    Abrir Formulario
                </Button>
                 */}

                {/* Modal con formulario */}
                <Dialog open={openModal} onClose={handleCloseModal}>
                    <DialogTitle>Formulario PDF</DialogTitle>
                    <DialogContent>
                        {/* Campos de entrada generados a partir de `camposFormulario` y `camposSelect` */}
                        {camposFormulario.map(({ nombre, label }) => (
                            <TextField
                                key={nombre}
                                label={label}
                                name={nombre}
                                variant="outlined"
                                value={formData[nombre] || ''}
                                onChange={handleInputChange}
                                fullWidth
                                margin="normal"
                            />
                        ))}
                        {camposSelect.map(({ nombre, label, opciones }) => (
                            <Select
                                key={nombre}
                                label={label}
                                name={nombre}
                                value={formData[nombre] || ''}
                                onChange={handleInputChange}
                                fullWidth
                                displayEmpty
                                margin="normal"
                            >
                                {opciones.map((opcion) => (
                                    <MenuItem key={opcion} value={opcion}>
                                        {opcion}
                                    </MenuItem>
                                ))}
                            </Select>
                        ))}
                    </DialogContent>
                    <DialogActions>
                        <Button variant="outlined" onClick={handleCloseModal}>Cerrar</Button>
                        <Button variant="contained" onClick={() => fillPdf(formData)}>Actualizar PDF</Button>
                        <Button variant="outlined" onClick={handleDownload} disabled={!pdfData}>Descargar PDF</Button>
                    </DialogActions>
                </Dialog>

                {/* Botón de descarga */}

            </Box>

            {/* Renderizar el PDF */}
            {pdfData && (
                <Box sx={{ cursor: 'pointer', width: '100%' }} onClick={() => setOpenModal(true)}>

                    <Worker workerUrl="/workers/pdf.worker.min.js">
                        <Viewer fileUrl={URL.createObjectURL(new Blob([pdfData], { type: 'application/pdf' }))} />
                    </Worker>
                </Box>

            )}
        </>
    );
};

export default PDFFormFiller;
