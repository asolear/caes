import React, { useState, useEffect, Suspense, lazy } from 'react';
import { AppBar, Box, Toolbar, Grid, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import CatalogFichas from './CatalogFichas.json'; // Importar el archivo JSON

const DynamicFichaComponent = ({ selectedCode, selectedSector }) => {
    const FichaComponent = lazy(() =>
        import(`../fichas/${selectedSector}/${selectedCode}.jsx`)
    );
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <FichaComponent />
        </Suspense>
    );
};

const SectorSelector = () => {
    const [data, setData] = useState([]);
    const [selectedSector, setSelectedSector] = useState('');
    const [selectedCode, setSelectedCode] = useState('');

    useEffect(() => {
        // Establecer los datos importados directamente
        setData(CatalogFichas);

        // Establecer el primer sector y el primer código como seleccionados por defecto
        const firstSector = CatalogFichas[0]?.sector || '';
        const firstCode = CatalogFichas.filter(item => item.sector === firstSector)[0]?.codigo || '';
        setSelectedSector(firstSector);
        setSelectedCode(firstCode);
    }, []);

    const handleSectorChange = (event) => {
        const sector = event.target.value;
        setSelectedSector(sector);

        // Obtener el primer código correspondiente al sector seleccionado
        const firstCode = data.filter(item => item.sector === sector)[0]?.codigo || '';
        setSelectedCode(firstCode); // Establecer el primer código
    };

    const handleCodeChange = (event) => {
        setSelectedCode(event.target.value);
    };

    const filteredCodes = data.filter(item => item.sector === selectedSector);
    const sectors = [...new Set(data.map(item => item.sector))];

    return (
        <>
            <AppBar position="sticky" sx={{ backgroundColor: 'white', boxShadow: 0 }}>
                <Toolbar>
                    <Box sx={{ display: 'flex', width: '100%' }}>
                        <Grid container spacing={2} sx={{ width: '100%' }}>
                            {/* Sector Select with responsive width */}
                            <Grid item xs={12} md={2}>
                                <FormControl fullWidth>
                                    <InputLabel>Sector</InputLabel>
                                    <Select
                                        value={selectedSector}
                                        onChange={handleSectorChange}
                                        label="Sector"
                                    >
                                        {sectors.map((sector) => (
                                            <MenuItem key={sector} value={sector}>
                                                {sector}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Código Select with responsive width */}
                            <Grid item xs={12} md={10} disabled={!selectedSector}>
                                <FormControl fullWidth>
                                    <InputLabel>Código</InputLabel>
                                    <Select
                                        value={selectedCode}
                                        onChange={handleCodeChange}
                                        label="Código"
                                    >
                                        {filteredCodes.map((item) => (
                                            <MenuItem key={item.codigo} value={item.codigo}>
                                                {item.codigo} - {item.nombre}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Box>
                </Toolbar>
            </AppBar>
            {selectedCode && (
                <Grid item xs={12}>
                    <DynamicFichaComponent selectedCode={selectedCode} selectedSector={selectedSector} />
                </Grid>
            )}
        </>
    );
};

export default SectorSelector;
