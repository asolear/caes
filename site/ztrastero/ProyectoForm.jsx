import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { Menu, IconButton, Grid, Typography, Box, TextField, Button, MenuItem, FormControl, InputLabel, Select, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { PDFDocument } from 'pdf-lib';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import ActuacionesEstandarizadas from "../data/ActuacionesEstandarizadas";
import debounce from 'lodash.debounce';
import DownloadIcon from '@mui/icons-material/Download';  // Importar el icono de descarga
import SaveIcon from '@mui/icons-material/Save';  // Importar el icono de guardar
import CalculateIcon from '@mui/icons-material/Calculate';  // Importar el icono de calcular
import CancelIcon from '@mui/icons-material/Cancel'; // Icono de cancelar
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
// import {camposFormulario,camposSelect,camposCalculados} from src/componentes/fichas/AGR010
// AGR010: Pantallas térmicas en invernaderos

const ProyectoForm = () => {
  const [sectores, setSectores] = useState([]);
  const [fichas, setFichas] = useState([]);
  const [selectedSector, setSelectedSector] = useState("");
  const [selectedFicha, setSelectedFicha] = useState("");
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const sortedSectores = useMemo(() => [...new Set(ActuacionesEstandarizadas.map(item => item["SECTOR"]))].sort(), []);
  useEffect(() => { setSectores(sortedSectores); if (sortedSectores.length > 0) setSelectedSector(sortedSectores[0]); }, [sortedSectores]);

  const getFichas = useCallback(() => { return ActuacionesEstandarizadas.filter(item => item["SECTOR"] === selectedSector).map(item => item["FICHA"]).sort() }, [selectedSector]);
  useEffect(() => { if (selectedSector) { const fichasList = getFichas(); setFichas(fichasList); if (fichasList.length > 0) { setSelectedFicha(fichasList[0]); } } else { setFichas([]); } }, [selectedSector, getFichas]);

  const componentName = selectedFicha.split(':')[0];
  // 
  const [camposFormulario, setCamposFormulario] = useState([]);
  const [camposCalculados, setCamposCalculados] = useState([]);
  const [camposSelect, setCamposSelect] = useState([]);
  // 
  const [formData, setFormData] = useState({});
  const [selectData, setSelectData] = useState({});
  const [calculatedData, setCalculatedData] = useState({});


  // useEffect para inicializar formData y selectData cuando cambia el componentName
  useEffect(() => {
    if (componentName) {
      import(`../componentes/${selectedSector}/${componentName}`)
        .then((module) => {
          setCamposFormulario(module.camposFormulario || []);
          setCamposSelect(module.camposSelect || []);
          setCamposCalculados(module.camposCalculados || []);
          // Inicializar los valores por defecto
          const initialFormData = module.camposFormulario.reduce((acc, campo) => ((acc[campo.nombre] = campo.valorPorDefecto || ''), acc), {});
          setFormData(initialFormData);
          // 
          const initialSelectData = module.camposSelect.reduce((acc, campo) => ((acc[campo.nombre] = campo.opciones[0] || ''), acc), {});
          setSelectData(initialSelectData);
          // 
          loadAndFillPDF(initialFormData, initialSelectData);
        })
        .catch((err) => console.error('Error al cargar el módulo:', err));
    }
  }, [componentName]);

  

  useEffect(() => {
    setCalculatedData(camposCalculados.reduce((acc, campo) => { acc[campo.nombre] = campo.calculate({ ...formData, ...acc }); return acc; }, {}));
  }, [formData, camposCalculados]);


  const loadAndFillPDF = async (dataForm = formData, dataSelect = selectData) => {
    try {
      const pdfDoc = await PDFDocument.load(
        await fetch(`/fichas/${selectedSector.toLowerCase()}/${componentName}.pdf`).then((res) => res.arrayBuffer())
      );
      const form = pdfDoc.getForm();

      // Usar dataForm y dataSelect para llenar el PDF
      Object.entries({ ...dataForm, ...calculatedData, ...dataSelect }).forEach(([campo, value]) => {
        try {
          form.getTextField(campo).setText(value.toString() || '');
        } catch (err) {
          console.warn(`Campo '${campo}' no encontrado en el PDF`, err);
        }
      });
      setPdfPreviewUrl(URL.createObjectURL(new Blob([await pdfDoc.save()], { type: 'application/pdf' })));
    } catch (pdfError) {
      console.error('Error al procesar el PDF:', pdfError);
      alert('Error en el PDF. Intenta nuevamente.');
    }
  };

  // Ejecutar loadAndFillPDF cuando cambian los valores de formData o selectData
  useEffect(() => {
    if (selectedFicha && pdfPreviewUrl) {
      loadAndFillPDF();
    }
    // }, [formData, selectData, selectedFicha]);
  }, [selectedFicha]);

  const handleInputChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSelectChange = e => setSelectData({ ...selectData, [e.target.name]: e.target.value });



  // Función para descargar el PDF relleno
  const handleDownload = async () => {
    try {
      const pdfDoc = await PDFDocument.load(
        await fetch(`/fichas/${selectedSector.toLowerCase()}/${componentName}.pdf`).then((res) => res.arrayBuffer())
      );
      const form = pdfDoc.getForm();

      // Rellenar el PDF con los datos del formulario
      Object.entries({ ...formData, ...calculatedData, ...selectData }).forEach(([campo, value]) => {
        try {
          form.getTextField(campo).setText(value || '');
        } catch (err) {
          console.warn(`Campo '${campo}' no encontrado en el PDF`, err);
        }
      });

      // Crear un Blob del PDF para descargarlo
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${selectedFicha}.pdf`;
      link.click();
    } catch (pdfError) {
      console.error('Error al generar el PDF:', pdfError);
      alert('Error al generar el PDF. Intenta nuevamente.');
    }
  };

  // 
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };


  return (
    <>
      <Box sx={{ padding: 1 }}>
        <Grid container spacing={1}>
          <Grid item xs={12} md={12}>
            <Box textAlign="center">
              <Typography variant="h5">Calculadora del Ahorro Energético</Typography>
            </Box>
          </Grid>
          <Grid item xs={1} md={1}>
            <IconButton
              aria-controls={open ? 'three-dots-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
              onClick={handleClick}
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              id="three-dots-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              MenuListProps={{
                'aria-labelledby': 'basic-button',
              }}
            >
              <MenuItem onClick={() => { handleClose(); setOpenModal(true); }}><IconButton color="primary"><EditIcon style={{ color: 'green', fontSize: '40px' }} /></IconButton> Editar (o Clic al documento)</MenuItem>
              <MenuItem onClick={() => { handleClose(); handleDownload(); }}><IconButton color="primary"><PictureAsPdfIcon style={{ color: 'red', fontSize: '40px' }} /></IconButton> Descargar PDF</MenuItem>
            </Menu>
          </Grid>
          <Grid item xs={3} md={2}>
            <FormControl fullWidth>
              <InputLabel>Sector</InputLabel>
              <Select
                value={selectedSector}
                onChange={(e) => {
                  setSelectedSector(e.target.value);
                  setSelectedFicha("");
                }}
                label="Sector"
              >
                {sectores.map((sector, index) => (
                  <MenuItem key={index} value={sector}>
                    {sector}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={8} md={8}>
            <FormControl fullWidth disabled={!selectedSector}>
              <InputLabel>Ficha</InputLabel>
              <Select
                value={selectedFicha}
                onChange={(e) => setSelectedFicha(e.target.value)}
                label="Ficha"
              >
                {fichas.map((ficha, index) => (
                  <MenuItem key={index} value={ficha}>
                    {ficha}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

        </Grid>
      </Box>




      {pdfPreviewUrl && (
        <Box sx={{ cursor: 'pointer', width: '100%' }} onClick={() => setOpenModal(true)}>
          <Worker workerUrl="/workers/pdf.worker.min.js">
            <Viewer fileUrl={pdfPreviewUrl} style={{ width: '100%', height: '500px' }} />
          </Worker>
        </Box>
      )}

      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>

        <DialogActions>
          <DialogTitle></DialogTitle>
          <IconButton color="error" sx={{ mt: 2, ml: 2 }} onClick={() => setOpenModal(false)}><CancelIcon />Cancelar</IconButton>
          <IconButton color="success" sx={{ mt: 2, ml: 2 }} onClick={() => { setOpenModal(false); loadAndFillPDF() }}><CalculateIcon />Calcular</IconButton>
        </DialogActions>

        <DialogContent>
          <form >
            {camposFormulario.map((campo) => <TextField key={campo.nombre} label={campo.label} type={campo.type === 'number' ? 'number' : 'text'} name={campo.nombre} value={formData[campo.nombre]} onChange={handleInputChange} fullWidth margin="normal" />)}
            {camposSelect.map((campo) => (
              <FormControl fullWidth margin="normal" key={campo.nombre}>
                <InputLabel>{campo.label}</InputLabel>
                <Select name={campo.nombre} value={selectData[campo.nombre]} onChange={handleSelectChange} label={campo.label}>
                  {campo.opciones.map((opcion, index) => <MenuItem key={index} value={opcion}>{opcion}</MenuItem>)}
                </Select>
              </FormControl>
            ))}
            {camposCalculados.map((campo) => <TextField key={campo.nombre} label={campo.label} type="text" name={campo.nombre} value={calculatedData[campo.nombre] || ''} InputProps={{ readOnly: true }} fullWidth margin="normal" />)}
          </form>
        </DialogContent>

      </Dialog>
    </>
  );
};

export default ProyectoForm;


