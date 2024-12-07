import React, { useMemo, useState, useEffect, Suspense, lazy } from 'react';
import { AppBar, Box, Toolbar, Grid, Select, MenuItem } from '@mui/material';
import Catalogo from '../Catalogo.json'; // Import the JSON file

const DynamicFichaComponent = ({ selectedGroup, selectedSector, selectedCode }) => {
    const FichaComponent = lazy(() =>
        import(`../${selectedGroup}/${selectedSector}/${selectedCode}.jsx`)
    );
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <FichaComponent />
        </Suspense>
    );
};

const Fichas = () => {
    const [data, setData] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState('');
    const [selectedSector, setSelectedSector] = useState('');
    const [selectedCode, setSelectedCode] = useState('');

    useEffect(() => {
        setData(Catalogo);

        // Default to the first group, sector, and code
        if (Catalogo.length > 0) {
            const firstGroup = Catalogo[0]?.grupo || '';
            const firstSector = Catalogo.find(item => item.grupo === firstGroup)?.sector || '';
            const firstCode = Catalogo.find(item => item.grupo === firstGroup && item.sector === firstSector)?.codigo || '';
            setSelectedGroup(firstGroup);
            setSelectedSector(firstSector);
            setSelectedCode(firstCode);
        }
    }, []);

    useEffect(() => {
        if (selectedGroup && selectedSector) {
            const firstCode = data.find(item => item.grupo === selectedGroup && item.sector === selectedSector)?.codigo || '';
            setSelectedCode(firstCode);
        }
    }, [selectedGroup, selectedSector, data]);

    const handleGroupChange = (event) => {
        const group = event.target.value;
        setSelectedGroup(group);

        // Update available sectors based on group
        const sectors = [...new Set(data.filter(item => item.grupo === group).map(item => item.sector))];
        setSelectedSector(sectors[0] || '');

        // Set the first available code for the selected group and sector
        const firstCode = data.find(item => item.grupo === group && item.sector === selectedSector)?.codigo || '';
        setSelectedCode(firstCode);
    };

    const handleSectorChange = (event) => {
        const sector = event.target.value;
        setSelectedSector(sector);

        // Set the first available code for the selected group and sector
        const firstCode = data.find(item => item.grupo === selectedGroup && item.sector === sector)?.codigo || '';
        setSelectedCode(firstCode);
    };

    const handleCodeChange = (event) => setSelectedCode(event.target.value);



const groups = useMemo(() => {
    return [...new Set(data.map(item => item.grupo))].sort();
}, [data]);

const sectors = useMemo(() => {
    return [...new Set(data.filter(item => item.grupo === selectedGroup).map(item => item.sector))].sort();
}, [data, selectedGroup]);

const filteredCodes = useMemo(() => {
    return data
        .filter(item => item.grupo === selectedGroup && item.sector === selectedSector)
        .sort((a, b) => a.codigo.localeCompare(b.codigo)); // Ordenar por el código
}, [data, selectedGroup, selectedSector]);

    return (
        <>
            <Box sx={{ flexGrow: 1 }}>
                <AppBar position="static">
                    <Toolbar
                        variant="dense"
                        sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            alignItems: { xs: 'stretch', sm: 'center' },
                            gap: 1,
                        }}
                    >
                        <Select
                            variant="standard"
                            sx={{
                                color: 'white',
                                '& .MuiSvgIcon-root': {
                                    color: 'white',
                                },
                                '&::before, &::after': {
                                    borderBottom: 'none',
                                },
                                width: { xs: '100%', sm: 'auto' },
                            }}
                            value={selectedGroup}
                            onChange={handleGroupChange}
                            displayEmpty
                        >
                            <MenuItem disabled value="">
                                <em>Selecciona un grupo</em>
                            </MenuItem>
                            {groups.map((group) => (
                                <MenuItem
                                    key={group}
                                    value={group}
                                    sx={{
                                        whiteSpace: 'normal',
                                        wordWrap: 'break-word',
                                    }}
                                >
                                    {group}
                                </MenuItem>
                            ))}
                        </Select>

                        <Select
                            variant="standard"
                            sx={{
                                color: 'white',
                                '& .MuiSvgIcon-root': {
                                    color: 'white',
                                },
                                '&::before, &::after': {
                                    borderBottom: 'none',
                                },
                                width: { xs: '100%', sm: 'auto' },
                            }}
                            value={selectedSector}
                            onChange={handleSectorChange}
                            disabled={!selectedGroup}
                            displayEmpty
                        >
                            <MenuItem disabled value="">
                                <em>Selecciona un sector</em>
                            </MenuItem>
                            {sectors.map((sector) => (
                                <MenuItem
                                    key={sector}
                                    value={sector}
                                    sx={{
                                        whiteSpace: 'normal',
                                        wordWrap: 'break-word',
                                    }}
                                >
                                    {sector}
                                </MenuItem>
                            ))}
                        </Select>

                        <Select
                            variant="standard"
                            sx={{
                                color: 'white',
                                '& .MuiSvgIcon-root': {
                                    color: 'white',
                                },
                                '&::before, &::after': {
                                    borderBottom: 'none',
                                },
                                width: { xs: '100%', sm: 'auto' },
                            }}
                            value={selectedCode}
                            onChange={handleCodeChange}
                            disabled={!selectedSector}
                            displayEmpty
                        >
                            <MenuItem disabled value="">
                                <em>Selecciona un código</em>
                            </MenuItem>
                            {filteredCodes.map((item) => (
                                <MenuItem
                                    key={item.codigo}
                                    value={item.codigo}
                                    sx={{
                                        whiteSpace: 'normal',
                                        wordWrap: 'break-word',
                                    }}
                                >
                                    {item.codigo} - {item.nombre}
                                </MenuItem>
                            ))}
                        </Select>
                    </Toolbar>
                </AppBar>
            </Box>

            {selectedCode && (
                <Grid container justifyContent="center" sx={{ padding: 2 }}>
                    <Grid item xs={12} md={12}>
                        <DynamicFichaComponent selectedGroup={selectedGroup} selectedSector={selectedSector} selectedCode={selectedCode} />
                    </Grid>
                </Grid>
            )}
        </>
    );
};

export default Fichas;
