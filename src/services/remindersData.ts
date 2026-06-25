import { Cliente, Mascota, Recordatorio, Mensaje } from '../types/reminders';

class RemindersData {
    private nombreClinica: string;

    constructor(nombreClinica: string) {
        this.nombreClinica = nombreClinica;
    }

    // Mapeo de códigos y términos a texto legible
    private readonly serviciosMap: { [key: string]: string } = {
        'transporte de clínica': 'transporte',
        'transporte': 'transporte',
        'consulta': 'consulta',
        'consulta nocturna': 'consulta nocturna',
        'consulta festivos': 'consulta en festivos',
        'urgencias': 'urgencias',
        'seguimiento': 'seguimiento',
        'control sin costo': 'control sin costo',
        'control sc': 'control sin costo',
        'seguimiento sct': 'seguimiento',
        'medicina preventiva': 'medicina preventiva',
        'vacunación': 'vacunación',
        'desparasitación': 'desparasitación',
        'hospitalización': 'hospitalización',
        'cirugía': 'cirugía',
        'procedimiento': 'procedimiento',
        'análisis clínicos': 'análisis clínicos',
        'rx-us': 'radiografía y ultrasonido',
        'rx': 'radiografía',
        'us': 'ultrasonido',
        'radiografía - us': 'radiografía y ultrasonido',
        'radiografía': 'radiografía',
        'ultrasonido': 'ultrasonido',
        'tratamiento': 'tratamiento',
        'láser': 'láser terapia',
        'láser terapia': 'láser terapia',
        'fisioterapia': 'fisioterapia',
        'certificado médico': 'certificado médico',
        'servicio fcm': 'servicio FCM',
        'fcm': 'servicio FCM',
        'castración': 'castración',
        'ovh': 'OVH (esterilización)',
        'esterilización': 'esterilización',
        'eutanasia': 'eutanasia'
    };

    // Procesar datos de Excel según el tipo
    procesarDatos(datos: any[][], tipo: 'vacunas' | 'citas'): Cliente[] {
        console.log(`🔍 RemindersData.procesarDatos - Tipo: ${tipo}`);
        console.log(`📊 Datos recibidos: ${datos?.length || 0} filas`);
    
        if (!datos || datos.length === 0) {
            console.warn('⚠️ No hay datos para procesar');
            return [];
        }

        console.log('📋 Encabezados:', datos[0]);
        
        if (tipo === 'vacunas') {
            console.log('🔄 Procesando VACUNAS...');
            const result = this.procesarVacunas(datos);
            console.log(`✅ Vacunas procesadas: ${result.length} clientes`);
            return result;
        } else if (tipo === 'citas') {
            console.log('🔄 Procesando CITAS...');
            const result = this.procesarCitas(datos);
            console.log(`✅ Citas procesadas: ${result.length} clientes`);
            return result;
        }

        console.warn('⚠️ Tipo no reconocido:', tipo);
        return [];
    }

    // Procesar template de vacunas
    private procesarVacunas(datos: any[][]): Cliente[] {
        const encabezadosExcel = datos[0];
        const titles = ["CLIENTE", "TELÉFONO 1", "MASCOTA", "TIPO DE RECORDATORIO", "VACUNA", "PRÓXIMA FECHA"];
        
        // Verificar que los encabezados coincidan
        const headersMatch = titles.every((title, index) => {
            const excelHeader = encabezadosExcel[index]?.toString().trim().toUpperCase() || '';
            return excelHeader === title.toUpperCase();
        });
        
        if (!headersMatch) {
            throw new Error(`Formato incorrecto para vacunas. Se requieren:\n${titles.join(' | ')}`);
        }

        const filasDatos = datos.slice(1);
        
        if (filasDatos.length === 0) {
            throw new Error('El Excel no contiene datos');
        }

        const clientes = this.prepareClientsVacunas(filasDatos);
        this.generateMessagesVacunas(clientes);
        
        return clientes;
    }

    // PrepareClients para vacunas
    private prepareClientsVacunas(rows: any[][]): Cliente[] {
        return rows.reduce((acc: Cliente[], cell: any[], index) => {
            try {
                const nombreCliente = this.formatString(cell[0]?.toString() || '');
                const telefono = this.formatNumbers(cell[1]?.toString() || '');
                const nombreMascota = this.formatString(cell[2]?.toString() || '');
                const nombreRecordatorio = this.formatString(cell[3]?.toString() || '');
                const tipoRecordatorio = this.formatString(cell[4]?.toString() || '');
                const fecha = cell[5]?.toString() || '';

                if (!nombreCliente || !telefono) {
                    console.log(`Fila ${index + 1} ignorada: datos insuficientes`);
                    return acc;
                }

                let cliente = acc.find(c => c.nombre === nombreCliente && c.telefono === telefono);
            
                if (!cliente) {
                    cliente = {
                        nombre: nombreCliente,
                        telefono,
                        mascotas: [],
                        mensajes: [],
                        status: false
                    };
                    acc.push(cliente);
                }

                if (nombreMascota && nombreMascota.trim() !== '') {
                    let mascota = cliente.mascotas.find(m => m.nombre === nombreMascota);
                    if (!mascota) {
                        mascota = {
                            nombre: nombreMascota,
                            recordatorios: []
                        };
                        cliente.mascotas.push(mascota);
                    }

                    if (nombreRecordatorio && nombreRecordatorio.trim() !== '') {
                        let recordatorio = mascota.recordatorios.find(r => r.nombre === nombreRecordatorio);
                        if (!recordatorio) {
                            recordatorio = {
                                nombre: nombreRecordatorio,
                                tipos: []
                            };
                            mascota.recordatorios.push(recordatorio);
                        }

                        if (tipoRecordatorio && tipoRecordatorio.trim() !== '' && fecha && fecha.trim() !== '') {
                            const existeTipo = recordatorio.tipos.some(t => 
                                t.nombre === tipoRecordatorio && t.fecha === fecha
                            );
                            
                            if (!existeTipo) {
                                recordatorio.tipos.push({
                                    nombre: tipoRecordatorio,
                                    fecha
                                });
                            }
                        }
                    }
                }

            } catch (error) {
                console.error(`Error procesando fila ${index + 1}:`, error);
            }

            return acc;
        }, []);
    }

    // Generar mensajes para vacunas
    private generateMessagesVacunas(clientes: Cliente[]) {
        clientes.forEach(cliente => {
            const mascotas = cliente.mascotas;
            let mensaje: string;
            
            cliente.mensajes.push(this.createNewMsg(`Hola ${cliente.nombre}.`));

            if (mascotas.length === 1) {
                mensaje = "su mascota '" + mascotas[0].nombre + "'," + this.listReminders(mascotas[0]);
            } else {
                mensaje = "sus mascotas: ";
        
                for (let i = 0; i < mascotas.length; i++) {
                    if (i === 0) {
                        mensaje += "'" + mascotas[i].nombre + "'," + this.listReminders(mascotas[i]);
                    } else {
                        if (i === (mascotas.length - 1)) {
                            mensaje += " y '" + mascotas[i].nombre + "'," + this.listReminders(mascotas[i]);
                        } else {
                            mensaje += ", '" + mascotas[i].nombre + "'," + this.listReminders(mascotas[i]);
                        }
                    }
                }
            }
        
            if (mascotas.length > 0 && 
                mascotas[0].recordatorios.length > 0 && 
                mascotas[0].recordatorios[0].tipos.length > 0) {
            
                const fecha = mascotas[0].recordatorios[0].tipos[0].fecha;
                mensaje += " el día " + this.formatDateLong(fecha) + ".";
            } else {
                mensaje += ".";
            }
        
            const nombreClinicaLimpio = this.extraerNombreClinica(this.nombreClinica);
            cliente.mensajes.push(this.createNewMsg(`${nombreClinicaLimpio} le informa que ${mensaje}`));
            
            let mensajeCita = `\n🐾 Quiere agendar su cita?`;
        
            cliente.mensajes.push(this.createNewMsg(mensajeCita));
        });
    }

    // ListReminders
    private listReminders(mascota: Mascota): string {
        let recordatorio = " tiene pendiente la aplicación de ";
        const recordatorios = mascota.recordatorios;

        if (recordatorios.length === 1) {
            recordatorio += recordatorios[0].nombre + this.listTypes(recordatorios[0]);
        } else {
            for (let i = 0; i < recordatorios.length; i++) {
                if (i === 0) {
                    recordatorio += recordatorios[i].nombre + this.listTypes(recordatorios[i]);
                } else {
                    if (i === (recordatorios.length - 1)) {
                        recordatorio += " y " + recordatorios[i].nombre + this.listTypes(recordatorios[i]);
                    } else {
                        recordatorio += ", " + recordatorios[i].nombre + this.listTypes(recordatorios[i]);
                    }
                }
            }
        }
        return recordatorio;
    }

    // ListTypes
    private listTypes(recordatorio: Recordatorio): string {
        let tipo = '';
        const tipos = recordatorio.tipos;
    
        if (tipos.length === 1) {
            tipo += " (" + tipos[0].nombre + ")";
        } else {
            for (let i = 0; i < tipos.length; i++) {
                if (i === 0) {
                    tipo += " (" + tipos[i].nombre;
                } else {
                    if (i === (tipos.length - 1)) {
                        tipo += " y " + tipos[i].nombre + ")";
                    } else {
                        tipo += ", " + tipos[i].nombre;
                    }
                }
            }
        }
        return tipo;
    }

    // Procesar template de citas
    private procesarCitas(datos: any[][]): Cliente[] {
        const encabezadosExcel = datos[0];
        const titles = ["FECHA", "INICIO", "TIPO VISITA", "PROPIETARIO", "MASCOTA", "TELÉFONO", "ASUNTO", "AGENDA", "ESTADO"];
        
        const headersMatch = titles.every((title, index) => {
            const excelHeader = encabezadosExcel[index]?.toString().trim().toUpperCase() || '';
            return excelHeader === title.toUpperCase();
        });
        
        if (!headersMatch) {
            throw new Error(`Formato incorrecto para citas. Se requieren:\n${titles.join(' | ')}`);
        }

        const filasDatos = datos.slice(1);
        
        if (filasDatos.length === 0) {
            throw new Error('El Excel no contiene datos');
        }

        const clientes = this.prepareClientsCitas(filasDatos);
        this.generateMessagesCitas(clientes);
        
        return clientes;
    }

    // PrepareClients para citas
    private prepareClientsCitas(rows: any[][]): Cliente[] {
        const citasPorCliente: { [claveCliente: string]: any[] } = {};
        
        rows.forEach((cell, index) => {
            try {
                const fecha = this.formatDateLong(cell[0]?.toString() || '');
                const hora_inicio = cell[1]?.toString() || '';
                const tipo_visita = this.formatString(cell[2]?.toString() || '');
                const propietario = this.formatString(cell[3]?.toString() || '');
                const nombreMascota = this.formatString(cell[4]?.toString() || '');
                const telefono = this.formatNumbers(cell[5]?.toString() || '');
                const asunto = cell[6]?.toString() || '';
                const agenda = this.formatString(cell[7]?.toString() || '');
                const estado = cell[8]?.toString() || '';

                if (!propietario || !telefono) {
                    console.log(`Fila ${index + 1} ignorada: datos insuficientes`);
                    return;
                }

                const claveCliente = `${propietario}_${telefono}`;
                
                if (!citasPorCliente[claveCliente]) {
                    citasPorCliente[claveCliente] = [];
                }
                
                citasPorCliente[claveCliente].push({
                    fecha,
                    hora_inicio,
                    tipo_visita,
                    nombreMascota,
                    asunto,
                    agenda,
                    estado,
                    propietario,
                    telefono
                });

            } catch (error) {
                console.error(`Error procesando fila ${index + 1}:`, error);
            }
        });

        const clientes: Cliente[] = [];
        
        Object.keys(citasPorCliente).forEach(claveCliente => {
            const citas = citasPorCliente[claveCliente];
            if (citas.length === 0) return;
            
            const primeraCita = citas[0];
            const cliente: Cliente = {
                nombre: primeraCita.propietario,
                telefono: primeraCita.telefono,
                mascotas: [],
                mensajes: [],
                status: false,
                fechaCita: primeraCita.fecha,
                horaCita: primeraCita.hora_inicio,
                tipoVisita: primeraCita.tipo_visita,
                asunto: primeraCita.asunto,
                agenda: primeraCita.agenda,
                estado: primeraCita.estado,
                todasLasCitas: citas
            };
            
            const mascotasUnicas = new Set<string>();
            citas.forEach(cita => {
                if (cita.nombreMascota && cita.nombreMascota.trim() !== '') {
                    mascotasUnicas.add(cita.nombreMascota);
                }
            });
            
            mascotasUnicas.forEach(nombreMascota => {
                cliente.mascotas.push({
                    nombre: nombreMascota,
                    recordatorios: []
                });
            });
            
            clientes.push(cliente);
        });
        
        return clientes;
    }

    // Generar mensajes para citas
    private generateMessagesCitas(clientes: Cliente[]) {
        clientes.forEach(cliente => {
            const todasLasCitas = (cliente as any).todasLasCitas;
            if (!todasLasCitas || todasLasCitas.length === 0) {
                return;
            }

            const primeraFecha = todasLasCitas[0].fecha;
            const mismoDia = todasLasCitas.every((cita: any) => cita.fecha === primeraFecha);
            
            const citasPorMascota: { [mascotaNombre: string]: any[] } = {};
            
            todasLasCitas.forEach((cita: any) => {
                if (cita.nombreMascota) {
                    if (!citasPorMascota[cita.nombreMascota]) {
                        citasPorMascota[cita.nombreMascota] = [];
                    }
                    citasPorMascota[cita.nombreMascota].push(cita);
                }
            });

            const mascotasConCitas = Object.keys(citasPorMascota);
            
            if (mascotasConCitas.length === 0) {
                return;
            }

            cliente.mensajes.push(this.createNewMsg(`Hola ${cliente.nombre}.`));

            const nombreClinicaLimpio = this.extraerNombreClinica(this.nombreClinica);
            
            let mensajeCita: string;
            
            if (mascotasConCitas.length === 1) {
                const mascotaNombre = mascotasConCitas[0];
                const citasMascota = citasPorMascota[mascotaNombre];
                mensajeCita = `la cita de su mascota '${mascotaNombre}' `;
                mensajeCita += this.listarCitasParaMascota(citasMascota, !mismoDia);
            } else {
                mensajeCita = "las citas de sus mascotas: ";
        
                for (let i = 0; i < mascotasConCitas.length; i++) {
                    const mascotaNombre = mascotasConCitas[i];
                    const citasMascota = citasPorMascota[mascotaNombre];
                    
                    if (i === 0) {
                        mensajeCita += `'${mascotaNombre}' `;
                        mensajeCita += this.listarCitasParaMascota(citasMascota, !mismoDia);
                    } else {
                        if (i === (mascotasConCitas.length - 1)) {
                            mensajeCita += ` y '${mascotaNombre}' `;
                            mensajeCita += this.listarCitasParaMascota(citasMascota, !mismoDia);
                        } else {
                            mensajeCita += `, '${mascotaNombre}' `;
                            mensajeCita += this.listarCitasParaMascota(citasMascota, !mismoDia);
                        }
                    }
                }
            }
            
            let mensajeCompleto = `${nombreClinicaLimpio} le recuerda ${mensajeCita}`;
            
            if (mismoDia && primeraFecha) {
                const fechaFormateada = this.formatFechaParaMensaje(primeraFecha);
                mensajeCompleto += ` ${fechaFormateada}`;
            }
            
            mensajeCompleto += `.\n\n`;
            
            if (todasLasCitas.length > 1) {
                const horasUnicas = new Set<string>();
                todasLasCitas.forEach((cita: any) => {
                    if (cita.hora_inicio) {
                        horasUnicas.add(cita.hora_inicio);
                    }
                });
                
                if (horasUnicas.size > 0) {
                    const horasArray = Array.from(horasUnicas);
                    if (horasArray.length === 1) {
                        mensajeCompleto += `⏰ Hora: ${horasArray[0]}\n`;
                    } else {
                        mensajeCompleto += `⏰ Horas: ${horasArray.join(', ')}\n`;
                    }
                }
            } else if (todasLasCitas[0].hora_inicio) {
                mensajeCompleto += `⏰ Hora: ${todasLasCitas[0].hora_inicio}\n`;
            }
            
            mensajeCompleto += `\nPor favor confirme su asistencia y el servicio con anticipación.\n\n¡Gracias! 🐾`;
            
            cliente.mensajes.push(this.createNewMsg(mensajeCompleto));
            
            delete (cliente as any).todasLasCitas;
        });
    }

    // Procesar servicios
    private procesarServicio(tipoVisita: string, asunto: string, estado: string): string {
        const servicios: string[] = [];
        
        const asuntoLower = asunto.toLowerCase();
        const terminosQuirurgicos = ['castración', 'ovh', 'esterilización', 'eutanasia'];
        const terminoQuirurgico = terminosQuirurgicos.find(term => asuntoLower.includes(term));
        
        if (terminoQuirurgico) {
            return this.serviciosMap[terminoQuirurgico] || terminoQuirurgico;
        }
        
        const tipoLower = tipoVisita.toLowerCase().trim();
        
        if (tipoLower.includes('peluquer') || tipoLower.includes('estética')) {
            return this.procesarServicioEstetica(asunto, estado);
        }
        
        const camposParaAnalizar = [
            tipoVisita,
            estado,
            asunto
        ];
        
        camposParaAnalizar.forEach(campo => {
            if (!campo || campo.trim() === '') return;
            
            const campoLower = campo.toLowerCase();
            
            Object.keys(this.serviciosMap).forEach(key => {
                if (campoLower.includes(key.toLowerCase())) {
                    const servicio = this.serviciosMap[key];
                    if (!servicios.includes(servicio)) {
                        servicios.push(servicio);
                    }
                }
            });
            
            if (campoLower.includes('rx') && campoLower.includes('us')) {
                if (!servicios.includes('radiografía y ultrasonido')) {
                    servicios.push('radiografía y ultrasonido');
                }
            }
        });
        
        if (servicios.length === 0) {
            return this.formatString(tipoVisita);
        }
        
        return this.combinarServicios(servicios);
    }

    private procesarServicioEstetica(asunto: string, estado: string): string {
        const textoCompleto = `${asunto} ${estado}`.toLowerCase();
        const servicios: string[] = [];
        
        const tieneB = textoCompleto.includes('b') && !textoCompleto.includes('bm') && !textoCompleto.includes('baño');
        const tieneBaño = textoCompleto.includes('baño') && !textoCompleto.includes('medicado');
        const tieneBM = textoCompleto.includes('bm') || textoCompleto.includes('baño medicado');
        const tieneCP = textoCompleto.includes('cp') || textoCompleto.includes('corte');
        const tieneTransporte = textoCompleto.includes('transporte');
        
        if (tieneCP) servicios.push('corte');
        if (tieneB || tieneBaño) servicios.push('baño');
        if (tieneBM) servicios.push('baño medicado');
        if (tieneTransporte) servicios.push('transporte');
        
        if (servicios.length === 0) {
            return this.procesarTextoGenerico(textoCompleto);
        }
        
        return this.combinarServicios(servicios);
    }

    private procesarTextoGenerico(texto: string): string {
        if (!texto || texto.trim() === '') return '';
        
        const partes = texto.split(/[, \-_]+/)
            .map(p => p.trim())
            .filter(p => p.length > 0 && p !== 'cp' && p !== 'bm' && p !== 'b');
        
        if (partes.length === 0) return '';
        
        const servicios = partes.map(parte => {
            const parteLower = parte.toLowerCase();
            for (const [key, value] of Object.entries(this.serviciosMap)) {
                if (parteLower.includes(key.toLowerCase())) {
                    return value;
                }
            }
            return this.formatString(parte);
        });
        
        const serviciosUnicos = [...new Set(servicios)];
        
        return this.combinarServicios(serviciosUnicos);
    }

    private combinarServicios(servicios: string[]): string {
        if (servicios.length === 0) return '';
        
        const unicos = [...new Set(servicios)];
        
        if (unicos.length === 1) {
            return unicos[0];
        } else if (unicos.length === 2) {
            return `${unicos[0]} y ${unicos[1]}`;
        } else {
            const ultimo = unicos.pop();
            return `${unicos.join(', ')} y ${ultimo}`;
        }
    }

    private listarCitasParaMascota(citas: any[], incluirFecha: boolean = true): string {
        if (citas.length === 0) return '';
        
        if (citas.length === 1) {
            return this.describirCita(citas[0], incluirFecha);
        } else {
            let descripcion = ` tiene ${citas.length} citas programadas: `;
            
            for (let i = 0; i < citas.length; i++) {
                const servicio = this.procesarServicio(
                    citas[i].tipo_visita, 
                    citas[i].asunto, 
                    citas[i].estado
                );
                
                if (i === 0) {
                    descripcion += this.construirDescripcionCita(citas[i], servicio, incluirFecha, false);
                } else {
                    if (i === (citas.length - 1)) {
                        descripcion += ` y ${this.construirDescripcionCita(citas[i], servicio, incluirFecha, true)}`;
                    } else {
                        descripcion += `, ${this.construirDescripcionCita(citas[i], servicio, incluirFecha, true)}`;
                    }
                }
            }
            
            return descripcion;
        }
    }

    private describirCita(cita: any, incluirFecha: boolean = true): string {
        const servicio = this.procesarServicio(
            cita.tipo_visita, 
            cita.asunto, 
            cita.estado
        );
        
        return this.construirDescripcionCita(cita, servicio, incluirFecha, false);
    }

    private construirDescripcionCita(
        cita: any, 
        servicio: string, 
        incluirFecha: boolean,
        esSegundaOMas: boolean
    ): string {
        let descripcion = '';
        
        const tipoVisitaBase = cita.tipo_visita.toLowerCase();
        const esEstetica = tipoVisitaBase.includes('peluquer') || tipoVisitaBase.includes('estética');
    
        if (esEstetica) {
            if (esSegundaOMas) {
                descripcion += servicio;
            } else {
                descripcion += `para ${servicio}`;
            }
        } else {
            const tipoFormateado = this.formatString(cita.tipo_visita);
            
            if (servicio.toLowerCase().includes(tipoVisitaBase)) {
                if (esSegundaOMas) {
                    descripcion += servicio;
                } else {
                    descripcion += `para ${servicio}`;
                }
            } else {
                if (servicio) {
                    if (esSegundaOMas) {
                        descripcion += `${tipoFormateado} (${servicio})`;
                    } else {
                        descripcion += `para ${tipoFormateado} (${servicio})`;
                    }
                } else {
                    if (esSegundaOMas) {
                        descripcion += tipoFormateado;
                    } else {
                        descripcion += `para ${tipoFormateado}`;
                    }
                }
            }
        }
        
        if (incluirFecha && cita.fecha) {
            descripcion += ` ${this.formatFechaParaMensaje(cita.fecha)}`;
        }
        
        if (cita.hora_inicio) {
            if (!esSegundaOMas || descripcion.includes('el día') || descripcion.includes('mañana')) {
                descripcion += ` a las ${cita.hora_inicio}`;
            } else {
                descripcion += ` ${cita.hora_inicio}`;
            }
        }
        
        return descripcion;
    }

    // Helpers
    private extraerNombreClinica(nombreCompleto: string): string {
        if (!nombreCompleto) return '';
        
        let nombre = nombreCompleto.trim();
        
        const prefijos = [
            'Clínica Veterinaria ',
            'La clínica veterinaria ',
            'la clínica veterinaria '
        ];
        
        for (const prefijo of prefijos) {
            if (nombre.toLowerCase().startsWith(prefijo.toLowerCase())) {
                nombre = nombre.substring(prefijo.length);
                break;
            }
        }
        
        return nombre;
    }

    private createNewMsg(contenido: string): Mensaje {
        return {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            contenido: contenido,
            timestamp: new Date().toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
            }),
            esPropio: true
        };
    }

    private formatString(cadena: string): string {
        if (!cadena || cadena.trim() === '') {
            return '';
        }
        
        let oracion = cadena.replace(/[-_]/g, " ");
        let palabras = oracion.toLowerCase().split(" ")
            .map((palabra) => {
                return palabra.charAt(0).toUpperCase() + palabra.slice(1);
            });
            
        return palabras.join(" ");
    }

    private formatNumbers(cadena: string): string {
        if (!cadena) return '';
        const numbers = "0123456789";
        let numeros = "";
        
        for(let i = 0; i < cadena.length; i++) {
            for(let x = 0; x < numbers.length; x++) {
                if(cadena.charAt(i) === numbers.charAt(x)){
                    numeros += cadena.charAt(i);
                    break;
                }
            }
        }
        return numeros;
    }

    private formatDateLong(date: string): string {
        if (!date) return '';
    
        let dateObject: Date;
    
        if (date.includes(' de ')) {
            const meses: { [key: string]: number } = {
                'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3,
                'mayo': 4, 'junio': 5, 'julio': 6, 'agosto': 7,
                'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
            };
            
            const partes = date.split(' de ');
            if (partes.length === 3) {
                const day = parseInt(partes[0]);
                const monthName = partes[1].toLowerCase();
                const year = parseInt(partes[2]);
                const month = meses[monthName];
                
                if (!isNaN(day) && month !== undefined && !isNaN(year)) {
                    return date;
                }
            }
        }
        
        if (date.includes('-')) {
            const [year, month, day] = date.split('-').map(Number);
            dateObject = new Date(year, month - 1, day);
        } else if (date.includes('/')) {
            const [day, month, year] = date.split('/').map(Number);
            dateObject = new Date(year, month - 1, day);
        } else {
            dateObject = new Date(date);
            if (!isNaN(dateObject.getTime())) {
                dateObject.setMinutes(dateObject.getMinutes() + dateObject.getTimezoneOffset());
            } else {
                return date;
            }
        }
        
        if (isNaN(dateObject.getTime())) {
            return date;
        }
        
        return dateObject.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    private esManana(fechaStr: string): boolean {
        if (!fechaStr) return false;
    
        try {
            let fechaCita: Date | undefined = undefined;
            
            if (fechaStr.includes('-')) {
                const [year, month, day] = fechaStr.split('-').map(Number);
                fechaCita = new Date(year, month - 1, day);
            } else if (fechaStr.includes('/')) {
                const [day, month, year] = fechaStr.split('/').map(Number);
                fechaCita = new Date(year, month - 1, day);
            } else if (fechaStr.includes(' de ')) {
                const meses: { [key: string]: number } = {
                    'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3,
                    'mayo': 4, 'junio': 5, 'julio': 6, 'agosto': 7,
                    'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
                };
                
                const partes = fechaStr.split(' de ');
                if (partes.length === 3) {
                    const day = parseInt(partes[0]);
                    const monthName = partes[1].toLowerCase();
                    const year = parseInt(partes[2]);
                    const month = meses[monthName];
                    
                    if (!isNaN(day) && month !== undefined && !isNaN(year)) {
                        fechaCita = new Date(year, month, day);
                    }
                }
            } else {
                fechaCita = new Date(fechaStr);
                if (!isNaN(fechaCita.getTime())) {
                    fechaCita.setMinutes(fechaCita.getMinutes() + fechaCita.getTimezoneOffset());
                }
            }
            
            if (!fechaCita || isNaN(fechaCita.getTime())) {
                return false;
            }
            
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            
            fechaCita.setHours(0, 0, 0, 0);
            
            const diffTime = fechaCita.getTime() - hoy.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            return diffDays === 1;
        } catch (error) {
            return false;
        }
    }

    private formatFechaParaMensaje(fechaStr: string): string {
        if (this.esManana(fechaStr)) {
            return "mañana";
        }
        return `el día ${this.formatDateLong(fechaStr)}`;
    }
}

export default RemindersData;