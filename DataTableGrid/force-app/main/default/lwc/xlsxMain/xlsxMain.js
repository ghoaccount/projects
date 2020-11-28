import { LightningElement, api } from "lwc";
import { loadScript } from "lightning/platformResourceLoader";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import workbook from "@salesforce/resourceUrl/xlsx";
export default class XlsxMain extends LightningElement {
    @api headerList;
    @api filename;
    @api worksheetNameList;
    sheetData;
    extension;
    librariesLoaded = false;

    renderedCallback() {
        if (this.librariesLoaded) return;
        this.librariesLoaded = true;
        Promise.all([loadScript(this, workbook + "/xlsx/xlsx.full.min.js")])
        .then(() => {
            console.log("success");
        })
        .catch(error => {
            console.log("error ! " + error);
        });
    }

    @api exportRecords(exportType, data) {
        let ex;
        this.extension = null;
        this.sheetData = data;
        try {
            if(exportType == 'csv') {
                this.extension = '.csv';
                this.exportToCSV();
            } else if(exportType == 'excel') {
                this.extension = '.xlsx';
                this.exportToExcel();
            } else {
                throw 'Merci de choisir un format entre "csv" et "excel"';
            }
        }catch(e) {
            ex = e;
        } finally {
            let msg = ex == null ? 'Export du fichier "' + this.filename + this.extension + '" terminé avec succès ' : ex;
            let isSuccess = ex == null ? true : false;
            this.showToast(msg, isSuccess);
        }
    }

    exportToExcel() {
        const XLSX = window.XLSX;  
        let ws_name = this.worksheetNameList;
        let xlsData;
        let xlsHeader;
        if(ws_name.length > 1) {
            xlsData   = this.sheetData;
            xlsHeader = this.headerList;
        } else {
            xlsData   = [this.sheetData];
            xlsHeader = [this.headerList];
        }
        let createXLSLFormatObj = Array(xlsData.length).fill([]);
        xlsHeader.forEach((item, index) => createXLSLFormatObj[index] = [item]);
        xlsData.forEach((item, selectedRowIndex)=> {
            let xlsRowKey = Object.keys(item[0]);
            item.forEach((value, index) => {
                var innerRowData = [];
                xlsRowKey.forEach(item=>{
                    innerRowData.push(value[item]);
                })
                createXLSLFormatObj[selectedRowIndex].push(innerRowData);
            })

        });
        var wb = XLSX.utils.book_new();
        var ws = Array(createXLSLFormatObj.length).fill([]);
        for (let i = 0; i < ws.length; i++) {
            let data = XLSX.utils.aoa_to_sheet(createXLSLFormatObj[i]);
            ws[i] = [...ws[i], data];
            XLSX.utils.book_append_sheet(wb, ws[i][0], ws_name[i]);
        }
        XLSX.writeFile(wb, this.filename + this.extension);
    }


    exportToCSV() {
        var data = this.sheetData;
        let csvIterativeData;  
        let csvSeperator  
        let newLineCharacter;  
        csvSeperator = ",";  
        newLineCharacter = "\n";  
        csvIterativeData = "";  
        csvIterativeData += this.headerList.join(csvSeperator);  
        csvIterativeData += newLineCharacter;  
        for (let i = 0; i < data.length; i++) {  
            let counter = 0;  
            for (let iteratorObj in this.headerList) {  
                let dataKey = this.headerList[iteratorObj];  
                if (counter > 0) {  csvIterativeData += csvSeperator;  }  
                if (  data[i][dataKey] !== null && data[i][dataKey] !== undefined) {  
                    csvIterativeData += '"' + data[i][dataKey] + '"';  
                } else {  
                    csvIterativeData += '""';  
                }  
                counter++;  
            }  
            csvIterativeData += newLineCharacter;  
        }
        let downloadElement = document.createElement('a');
        downloadElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csvIterativeData);
        downloadElement.target = '_self';
        downloadElement.download = this.filename + this.extension;
        document.body.appendChild(downloadElement);
        downloadElement.click();
    }
    
    showToast(message, success) {
        let title = success ? 'Success' : 'Error';
        let variant = success ? 'success' : 'error';
        const event = new ShowToastEvent({
            "title": title,
            "message": message,
            "variant" : variant
        });
        this.dispatchEvent(event);
    }
}