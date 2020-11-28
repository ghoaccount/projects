import { LightningElement, track } from 'lwc';

import getRecords from '@salesforce/apex/SM001_AccountDataGrid.fetchAccounts'


export default class Lwc001_AccountDataGrid extends LightningElement {
    workSheetNameList = ["Prix"];
    filename = 'Prix';
    columns = [
        { label: 'Id', fieldName: 'Id', sortable: true},
        { label: 'Name', fieldName: 'Name', sortable: true },
        { label: 'RecordType', fieldName: 'RecordType', sortable: true }
    ]
    data = [];
    headerList =  ['Id', 'Name', 'RecordType'];

    connectedCallback() {
        getRecords().then(response => {
            let records = [];
            response.forEach(rec => {
                records.push({
                    'Id' : rec.Id,
                    'Name' : rec.Name,
                    'RecordType' : rec.RecordType.DeveloperName
                })
            });
            this.data = records;
        })
        .catch(error => {
            alert(error);
        });
    } 

    sortBy(field, reverse, primer) {
        const key = primer
            ? function(x) {
                  return primer(x[field]);
              }
            : function(x) {
                  return x[field];
              };

        return function(a, b) {
            a = key(a);
            b = key(b);
            return reverse * ((a > b) - (b > a));
        };
    }

    onHandleSort(event) {
        const { fieldName: sortedBy, sortDirection } = event.detail;
        const cloneData = [...this.data];
        cloneData.sort(this.sortBy(sortedBy, sortDirection === 'asc' ? 1 : -1));
        this.data = cloneData;
        this.sortDirection = sortDirection;
        this.sortedBy = sortedBy;
    }

    exportFile(event) { 
       this.template.querySelector("c-xlsx-main").exportRecords(event.target.dataset.name, this.data);
    } 
}