import sys
import os
import shutil

from types import SimpleNamespace  # Importación global

import pandas as pd
import io
import yaml
import pandas as pd
import time
import subprocess
import json
import PyPDF2
from pdfrw import PdfReader, PdfWriter, PdfName, PdfString
import inspect
from PyPDF2.generic import ArrayObject, IndirectObject
import fitz  # PyMuPDF
import pikepdf
import requests
import tkinter as tk
from tkinter import messagebox
from tkinter.messagebox import showinfo as alerta
import abc
import csv
from bs4 import BeautifulSoup


class mm:
    def mostrar_opciones(self):
        return self.generar_menu()

    def generar_menu(self):
        # Filtrar todas las funciones que no sean métodos de la clase base 'mm'
        opciones = {}
        numero = 1  # Inicializamos el número de las opciones
        for atributo in dir(self):
            # Excluir métodos de la clase base 'mm' y métodos internos
            if (
                callable(getattr(self, atributo))
                and not atributo.startswith("__")
                and atributo not in ["mostrar_opciones", "generar_menu", "mostrar_menu"]
            ):
                opciones[str(numero)] = getattr(self, atributo)
                numero += 1
        opciones["0"] = None  # Opción para regresar al supermenú
        return opciones

    def mostrar_menu(self, menu):
        while True:
            print("\n--- Menú ---")
            for opcion, funcion in menu.items():
                if opcion == "0":
                    print(f"{opcion}. Regresar al supermenú")
                else:
                    print(
                        f"{opcion}. {funcion.__name__.replace('_', ' ').capitalize()}"
                    )  # Mostrar la opción como texto

            opcion = input("Seleccione una opción: ")

            if opcion in menu:
                funcion = menu[opcion]
                if funcion is None:
                    break  # Regresar al supermenú
                funcion()  # Ejecutar la función
            else:
                print("Opción no válida. Intente de nuevo.")


def mostrar_supermenu(clase_padre):
    while True:
        # Detectar las clases anidadas dinámicamente, excluyendo la clase 'mm'
        clases = [
            attr
            for attr in dir(clase_padre)
            if isinstance(getattr(clase_padre, attr), type)
            and getattr(clase_padre, attr) is not mm
        ]

        print("\n--- Menú de Submenús ---")
        # Mostramos la opción 0 para salir
        print("0. Salir")
        for i, clase in enumerate(clases, 1):
            print(f"{i}. {clase.replace('_', ' ').capitalize()}")

        opcion = input("Seleccione una opción: ")
        if opcion == "0":
            print("Saliendo del programa.")
            break
        elif opcion.isdigit() and 1 <= int(opcion) <= len(clases):
            clase_seleccionada = clases[int(opcion) - 1]
            # Instanciamos la clase seleccionada
            instancia_clase = getattr(clase_padre, clase_seleccionada)()
            # Llamamos al método mostrar_menu de la clase base
            instancia_clase.mostrar_menu(
                instancia_clase.generar_menu()
            )  # Correcto aquí
        else:
            print("Opción no válida. Intente de nuevo.")


def mostrar_super_supermenu():
    while True:
        print("\n--- Super Supermenú ---")
        print("0. Salir")

        # Obtener las clases contenedoras SUPERMENU_A y SUPERMENU_B
        superclases = []
        for cls_name, cls_obj in globals().items():
            # Verificamos si el objeto es una clase que contiene otras clases
            if isinstance(cls_obj, type) and cls_name.startswith("_"):
                superclases.append(cls_obj)

        superclases.sort(key=lambda x: x.__name__)

        # Mostramos las opciones de las superclases
        for i, superclase in enumerate(superclases, 1):
            print(f"{i}. {superclase.__name__.replace('_', ' ').capitalize()}")

        opcion = input("Seleccione una opción: ")
        if opcion == "0":
            print("Saliendo del programa.")
            break
        elif opcion.isdigit() and 1 <= int(opcion) <= len(superclases):
            clase_seleccionada = superclases[int(opcion) - 1]
            # Mostrar el supermenú de la clase seleccionada
            mostrar_supermenu(clase_seleccionada)
        else:
            print("Opción no válida. Intente de nuevo.")


class _00_MKDOCS:

    class _02_Crear_md_para_cada_pdf(mm):

        def crea_md(
            ss,
            nombre="pp",
            carpeta="/home/pk/Desktop/caes07/docs/pp/",
        ):
            """"""
            # https://www.miteco.gob.es/es/energia/eficiencia/cae/catalogo-de-fichas/catalogo-vigente-de-fichas.html
            # df = pd.read_csv(StringIO(fichas))

            path = f"{carpeta}/{nombre}.pdf"
            # para importar los formlariopdf
            formlariopdf = "".join(carpeta.split("/")[1:]) + "".join(
                nombre.split(" ")[:3]
            ).replace(" ", "").replace(",", "").replace("-", "")
            print(nombre)
            tipodoc = carpeta.split("/")[-2]

            try:
                """"""
                pdf = PdfReader(path)
            except:
                """"""
                print(f"{path}  corrupto")
                return

            tt = []
            tt.append(
                rf"""
# {nombre}

<a href='../{nombre}.pdf' download>
<button class='md-button -primary' 
id='download-btn' style="position: fixed; top: 10%; right: 20px; 
        transform: translateY(-50%); z-index: 1000;  border: none; ">
:fontawesome-solid-file-arrow-down: 
</button>
</a>

<div 
    id='../{nombre}.pdf' 
    data-pdf-url='../{nombre}.pdf'
    style=' width: 100%; height: auto;overflow: auto;'>
</div>

"""
            )

            # quitarlo del try para sobreescribirlos todos
            archivo_path = os.path.join(carpeta, f"{nombre}.md")

            # Intenta abrir el archivo en modo "x" (solo si no existe)
            with open(archivo_path, "w") as archivo:
                archivo.write("\n".join(tt))
                print(f"Archivo {archivo_path} creado correctamente.")

        def _01_crear_todos_los_md_para_cada_pdf(
            ss,
        ):
            """"""
            print("crando un componente react generico para cada formulario pdf")

            # directorio = "src/Estandarizada"

            # Iterar sobre las carpetas (y archivos) en el directorio
            for root, dirs, files in os.walk("docs/"):
                for directorio in dirs:
                    print(directorio)
                    # continue
                    # if directorio[
                    #     0
                    # ].islower():  # Verificar si la primera letra es mayúscula
                    #     continue

                    archivos_pdf = []
                    for root, dirs, files in os.walk(f"docs/{directorio}"):
                        for file in files:
                            if file.endswith(".pdf"):
                                archivos_pdf.append(
                                    (file, root)
                                )  # Almacena una tupla con el nombre del archivo y la carpeta

                    for formulario in archivos_pdf:
                        nombre = formulario[0].split(".")[0]
                        carpeta = formulario[1]
                        ss.crea_md(nombre, carpeta)

            # los formlariopdf los he sacado del los componetes para poder editarlos mas facil en u mismo archivo

            # ss._03_crear_el_catalogo_json_que_genera_el_menu_de_react()
            # ss._03_crear_el_catalogo_json_que_genera_el_menu_de_react()

        def _09_eliminartodosloscomponetesdefichas_en_Ahorro(ss):
            """"""
            import os

            # os.system("clear")
            print(99999999999999999999999)

            def eliminar_archivos_jsx(carpeta):
                # Recorrer la carpeta y sus subcarpetas
                for root, dirs, files in os.walk(carpeta):
                    for file in files:
                        print(file)
                        if not file.endswith((".pdf", ".tex")):

                            print(f"eliminado {file}")

                            file_path = os.path.join(
                                root, file
                            )  # Obtener la ruta completa del archivo

                            with open(file_path, "r") as f:
                                contenido = f.read()

                            if "noborrar" in contenido:
                                continue

                            os.remove(file_path)  # Eliminar el archivo
                            print(f"Archivo eliminado: {file_path}")

            # Especificar la carpeta donde se encuentran los archivos a eliminar

            carpetas = [
                d
                for d in os.listdir("docs/")
                if os.path.isdir(os.path.join("docs/", d))
            ]

            # solo para asegurar que no se borra componentes jsx del sitio
            carpetas = [item for item in carpetas if not "js" in item]
            # carpetas = [item for item in carpetas if "Estudios" in item]

            for carpeta in carpetas:
                # para que solo borre las qwue empiece poir mayuscula
                if 1:
                    carpeta = f"docs/{carpeta}"
                    eliminar_archivos_jsx(carpeta)


if __name__ == "__main__":
    """el codigo tiene que estar en superclase/clase/funcion con los nombres en mayuscula y se ira ijecutando en orden"""
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    mostrar_super_supermenu()
