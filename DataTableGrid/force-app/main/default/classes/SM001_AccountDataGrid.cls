public with sharing class SM001_AccountDataGrid {
     
    @AuraEnabled
    public static List<Account> fetchAccounts() {
        return [SELECT Id, Name, RecordType.DeveloperName FROM Account];
    }
}
