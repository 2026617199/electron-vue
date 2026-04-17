type MachineFingerprintComponents = {
    cpuId: string;
    motherboardId: string;
    diskSerialNumber: string;
    macAddress: string;
    machineUuid: string;
    userHost: string;
}

type ElectronStoreType = ReturnType<typeof ElectronStore>;
