import pdfUrl from './AGR010 MAE Pantallas térmicas en invernaderos.pdf';

import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../components/firebase/firebaseConfig';

import React, { useEffect, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { InputAdornment, List, ListItem, ListItemText, Link, Typography, FormHelperText, FormControl, InputLabel, Select, Dialog, MenuItem, DialogActions, DialogContent, DialogTitle, Button, TextField, Paper } from "@mui/material";
import { PDFDocument } from "pdf-lib";
import Draggable from "react-draggable";
import SettingsIcon from '@mui/icons-material/Settings';
import { IconButton } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CloseIcon from "@mui/icons-material/Close";
import TuneIcon from '@mui/icons-material/Tune';
import CalculateIcon from '@mui/icons-material/Calculate';
import DownloadIcon from '@mui/icons-material/Download';
import CheckIcon from '@mui/icons-material/Check';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import EnergySavingsLeafOutlinedIcon from '@mui/icons-material/EnergySavingsLeafOutlined';
// import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { CircularProgress } from "@mui/material";
// importimportimport
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// pdfjsLib.GlobalWorkerOptions.workerSrc = `/workers/pdf.worker.min.js`;
pdfjsLib.GlobalWorkerOptions.workerSrc = `/workers/3.11.174/pdf.worker.min.js`;
// pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Desestructuración de las propiedades


const PaperComponent = (props) => (
  <Draggable
    handle="#draggable-dialog-title"
    cancel={'[class*="MuiDialogContent-root"]'}
  >
    <Paper {...props} />
  </Draggable>
);

const PDFRenderer = () => {









                































    const T1= {
      A3: { "45°C": 1.281, "55°C": 1.246, "65°C": 1.197 },
      A4: { "45°C": 1.287, "55°C": 1.251, "65°C": 1.196 },
    };
    const T2= {
      A3: { "45°C": 777, "55°C": 1.246, "65°C": 1.197 },
      A4: { "45°C": 1.287, "55°C": 1.251, "65°C": 1.196 },
    };


    const formulario= [
      // { nombre: "fT1", label: "fila1", opciones:Object.keys(T1) , valorPorDefecto: Object.keys(T1)[0], ayuda: "ayuda hola" }, 
      // { nombre: "cT1", label: "Colu1", opciones:Object.keys(T1[Object.keys(T1)[0]]), valorPorDefecto:Object.keys(T1[Object.keys(T1)[0]])[0], ayuda: ""  }, 
    
       {nombre:  "Proyecto", label: "Proyecto", valorPorDefecto: '' ,ayuda: ""},
       {nombre:  "Tecnico", label: "Tecnico", valorPorDefecto: '' ,ayuda: ""},
       {nombre:  "Organizacion", label: "Organizacion", valorPorDefecto: '' ,ayuda: ""},
       {nombre:  "NIF", label: "NIF", valorPorDefecto: '' ,ayuda: ""},
       {nombre:  "Fecha", label: "Fecha", valorPorDefecto: '' ,ayuda: ""},

   ];

    const calculados= (d) => {
        const t = {...d,
        // "sacando un valor de la tabla": T1?.[d.fT1]?.[d.cT1] ?? "Tab?", 
        };
        const v = {...t,
        //  "otra operacion con el valor de la tabla ": d["sacando un valor de la tabla"]*2, 
        };
        return {...v, 
        'Textfield-0 po ejemplo': (d.S * (d.Ki - d.Kp) * (d.ti - d.te) * d.h).toFixed(0), // Ejemplo de cálculo
        };
    };
                            
    const Referencias= [
        { nombre: 'Sistema de Certificados de Ahorro Energético (CAE)', url: 'https://www.miteco.gob.es/es/energia/eficiencia/cae.html' },
        // {nombre:'Ahorro y Eficiencia Energética en Invernaderos',url:'https://www.idae.es/uploads/documentos/documentos_10995_Agr07_AyEE_en_invernaderos_A2008_9e4c63f5.pdf'},
    ];













                










  const [user] = useAuthState(auth);

  // constconstconst
  const navigate = useNavigate();

  const [camposFormulario, setCamposFormulario] = useState(formulario);

  const [formData, setFormData] = useState(
    Object.fromEntries(camposFormulario.map(({ nombre, valorPorDefecto }) => [nombre, valorPorDefecto]))
  );

  const [open, setOpen] = useState(false);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSave = () => {

    if (user) {
      const updatedFormData = calculados(formData);
      setFormData(updatedFormData);

      setCamposFormulario((prev) =>
        prev.map((campo) => ({
          ...campo,
          valorPorDefecto: updatedFormData[campo.nombre],
        }))
      );
      updatePdfWithNewValues();
      toast.success('PDF actualizado');

      // Aquí va tu lógica para usuarios autenticados
    } else {
      toast.error('Debe Iniciar sesión');
    }



  };

  const renderPdfAsImages = async (modifiedPdfBytes) => {
    try {
      const pdf = await pdfjsLib.getDocument({ data: modifiedPdfBytes }).promise;
      const pages = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.5 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: context, viewport }).promise;
        pages.push(canvas.toDataURL("image/png"));
      }
      setImages(pages);
    } catch (err) {
      setError("Failed to render PDF.");
      console.error(err);
    }
  };

  const fillPdfFields = async (pdfUrl) => {
    if (!formData) {
      throw new Error("formData no está definido.");
    }

    try {
      const existingPdfBytes = await fetch(pdfUrl).then((res) => res.arrayBuffer());
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const form = pdfDoc.getForm();
      form.getFields().forEach((field) => console.log(`Campo en PDF: ${field.getName()}`));

      // Usar valores calculados
      const updatedData = calculados(formData);

      Object.entries(updatedData).forEach(([nombre, valor]) => {
        try {
          const field = form.getField(nombre);
          field.setText(String(valor)); // Actualiza el campo con los valores calculados
        } catch (err) {
          console.warn(`Campo '${nombre}' no encontrado en el PDF:`, err.message);
          // Continúa con el siguiente campo
        }
      });

      return await pdfDoc.save();
    } catch (err) {
      console.error("Error filling PDF fields:", err);
      throw new Error(`Error filling PDF fields: ${err.message}`);
    }
  };

  const updatePdfWithNewValues = async () => {
    setLoading(true);
    try {
      const modifiedPdfBytes = await fillPdfFields(pdfUrl);
      await renderPdfAsImages(modifiedPdfBytes);
    } catch (err) {
      console.error("Error updating the PDF:", err); // Log detallado
      setError(`An error occurred while updating the PDF: ${err.message}`); // Mensaje específico
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialData = calculados(
      Object.fromEntries(camposFormulario.map(({ nombre, valorPorDefecto }) => [nombre, valorPorDefecto]))
    );
    setFormData(initialData);
    updatePdfWithNewValues();
  }, []);


  const handleDownload = async () => {

    if (user) {
      const modifiedPdfBytes = await fillPdfFields(pdfUrl); // Get the modified PDF
      const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'modified-pdf.pdf'; // Set the filename for the download
      link.click(); // Trigger download
    } else {
      toast.error('Debe Iniciar sesión');
    }
  };


  return (
    <div>



      <IconButton
        onClick={() => setOpen(true)}
        color="success"
        style={{
          position: 'fixed', // Fija el botón en la pantalla
          top: '50%', // Distancia desde el borde inferior
          right: '20px', // Distancia desde el borde derecho
          backgroundColor: 'white', // Color de fondo para mayor visibilidad
          boxShadow: '0px 4px 6px rgba(0,0,0,0.1)', // Sombra para destacar el botón
          backgroundColor: "rgba(255, 255, 255, 0.5)", // Blanco translúcido

        }}
      >
        <TuneIcon />
      </IconButton>




      {user ?
        <>
          <IconButton
            onClick={() => handleDownload()}
            color="success"
            style={{
              position: 'fixed', // Fija el botón en la pantalla
              top: '60%', // Distancia desde el borde inferior
              right: '20px', // Distancia desde el borde derecho
              backgroundColor: 'white', // Color de fondo para mayor visibilidad
              boxShadow: '0px 4px 6px rgba(0,0,0,0.1)', // Sombra para destacar el botón
              backgroundColor: "rgba(255, 255, 255, 0.5)", // Blanco translúcido

            }}
          >
            <DownloadIcon />
          </IconButton>
        </>
        :
        <>
          <IconButton
            onClick={() => handleDownload()}
            // color="error"
            style={{
              position: 'fixed', // Fija el botón en la pantalla
              top: '60%', // Distancia desde el borde inferior
              right: '20px', // Distancia desde el borde derecho
              backgroundColor: 'white', // Color de fondo para mayor visibilidad
              boxShadow: '0px 4px 6px rgba(0,0,0,0.1)', // Sombra para destacar el botón
              backgroundColor: "rgba(255, 255, 255, 0.5)", // Blanco translúcido

            }}
          >
            <DownloadIcon />
          </IconButton>

        </>}



      {/* {loading && <p style={{ textAlign: "center" }}>Loading PDF...</p>} */}
      {loading && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress />
        </div>
      )}




      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        {images.map((src, index) => (
          <img key={index} src={src} alt={`Page ${index + 1}`} style={{ width: "100%", borderRadius: "8px" }} onClick={() => setOpen(true)} />
        ))}
      </div>
      <Dialog
        disableScrollLock
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperComponent={PaperComponent}
        style={{ width: '250px' }}
        sx={{
          '& .MuiPaper-root': {
            backgroundColor: 'rgba(255, 255, 255, 0.9)', // Fondo semitransparente
          },
        }}
      >
        <DialogTitle id="draggable-dialog-title" style={{ cursor: "move" }}>
          Parámetros
        </DialogTitle>
        <DialogContent>
          {camposFormulario.map(({ nombre, label, opciones, valorPorDefecto, ayuda }) => (
            opciones ? (
              // Campo de selección (dropdown)
              <div key={nombre}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel htmlFor={`${nombre}-label`}
                  >{label}
                  </InputLabel>
                  <Select
                    labelId={`${nombre}-label`}
                    id={`${nombre}-label`}
                    defaultValue={valorPorDefecto}
                    label={label}
                    variant="outlined" // Asegura que el Select tenga un borde
                    name={nombre}
                    ayuda={ayuda}
                    value={formData[nombre] || ""}
                    onChange={handleInputChange}
                    fullWidth
                  >
                    {opciones.map((opcion) => (
                      <MenuItem key={opcion} value={opcion}  >
                        {opcion}
                      </MenuItem>
                    ))}
                  </Select>
                  <InputAdornment>
                    <FormHelperText>
                      {ayuda !== "" ? (<Link href={ayuda} target="_blank" rel="noopener noreferrer" ><InfoOutlinedIcon /></Link>) : null}
                    </FormHelperText>
                  </InputAdornment>
                </FormControl>
              </div>
            ) : (
              // Campo de texto
              <FormControl >
                <TextField
                  key={nombre}
                  name={nombre}
                  label={label}
                  ayuda={ayuda}
                  value={formData[nombre] || ""}
                  onChange={(e) => {
                    const { name, value } = e.target;
                    setFormData((prev) => ({
                      ...prev,
                      [name]: value, // Actualiza el estado correctamente
                    }));
                  }}
                  fullWidth
                  margin="dense"
                  variant="outlined"
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment >
                          <FormHelperText>
                            {ayuda !== "" ? (<Link href={ayuda} target="_blank" rel="noopener noreferrer" ><InfoOutlinedIcon /></Link>) : null}
                          </FormHelperText>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </FormControl>
            )
          ))}
        </DialogContent>

        <DialogActions>
          <IconButton onClick={() => setOpen(false)} color="error">
            <CloseIcon />
          </IconButton>
          {/* <IconButton color="error" onClick={handleDownload}>
            <PictureAsPdfIcon />
          </IconButton> */}
          {user ?
            <IconButton color="success" onClick={() => { handleSave() }}>
              {/* <CheckIcon />  */}
              Calcular
            </IconButton>
            :
            <IconButton color="danger" onClick={() => { handleSave() }}>
              {/* <CheckIcon />  */}
              Calcular
            </IconButton>
          }
        </DialogActions>
      </Dialog>


      <Typography variant="h6" gutterBottom>
        Referencias
      </Typography>
      <List>
        {Referencias.map((referencia, index) => (
          <ListItem key={index}>
            <ListItemText
              primary={
                <Link href={referencia.url} target="_blank" rel="noopener noreferrer" underline="hover">
                  {referencia.nombre}
                </Link>
              }
            />
          </ListItem>
        ))}
      </List>
            <ToastContainer />

    </div>
  );
};
export default PDFRenderer;


































                








