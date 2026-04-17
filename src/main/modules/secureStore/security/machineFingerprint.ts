import { execSync } from 'child_process';
import * as os from 'os';
import * as crypto from 'crypto'

class MachineFingerprint {
    getFingerprint() {
        const components = this.collectComponents();
        return components
    }

    collectComponents() {
        const components: MachineFingerprintComponents = {
            cpuId: '',
            motherboardId: '',
            diskSerialNumber: '',
            macAddress: '',
            machineUuid: '',
            userHost: '',
        };

        // 收集CPU ID
        components.cpuId = this.getCpuId();

        // 收集主板ID
        components.motherboardId = this.getMotherboardId();

        // 收集硬盘序列号
        components.diskSerialNumber = this.getDiskSerialNumber();

        // mac地址
        components.macAddress = this.getMacAddress();

        // 机器uuid（windows）或 hardware id（mac）
        components.machineUuid = this.getMachineUuid();

        // 用户名 + 主机名
        components.userHost = this.getUserHostname();

        return components;
    }

    // 获取CPU ID
    getCpuId() {
        try {
            // windows
            if (process.platform === 'win32') {
                const result = execSync('wmic cpu get ProcessorId /format:value',
                    { encoding: 'utf-8', windowsHide: true });
                const matched = result.match(/ProcessorId=(\w+)/);
                return matched ? matched[1] : '';
            }
            // mac
            else if (process.platform === 'darwin') {
                const macCpuId = execSync('sysctl -n machdep.cpu.brand_string',
                    { encoding: 'utf-8' }).trim();
                const matched = macCpuId.match(/(\w+)/);
                return matched ? matched[1] : '';
            } else {
                const  cpuInfo = execSync(`cat /proc/cpuinfo | grep "Serial" | awk \'{print $3}\'`,
                    { encoding: 'utf-8' }).trim();
                return cpuInfo || '';
            }
        } catch (error) {
            return os.cpus()[0].model || '';
        }
    }

    // 获取主板ID
    getMotherboardId() {
        try {
            // windows
            if (process.platform === 'win32') {
                const result = execSync('wmic baseboard get SerialNumber /format:value',
                    { encoding: 'utf-8', windowsHide: true });
                const matched = result.match(/SerialNumber=(\w+)/);
                return matched ? matched[1] : '';
            }
            // mac
            else if (process.platform === 'darwin') {
                const macMotherboardId = execSync('system_profiler SPHardwareDataType | grep "Serial Number" | awk \'{print $4}\'',
                    { encoding: 'utf-8' }).trim();
                return macMotherboardId || '';
            } else {
                return '';
            }
        } catch (error) {
            return '';
        }
    }

    // 获取硬盘序列号
    getDiskSerialNumber() {
        try {
            // windows
            if (process.platform === 'win32') {
                const result = execSync('wmic diskdrive get SerialNumber /format:value',
                    { encoding: 'utf-8', windowsHide: true });
                const matched = result.match(/SerialNumber=(\w+)/);
                return matched ? matched[1] : '';
            }
            // mac
            else if (process.platform === 'darwin') {
                const macDiskSerialNumber = execSync('system_profiler SPHardwareDataType | grep "Serial Number" | awk \'{print $4}\'',
                    { encoding: 'utf-8' }).trim();
                return macDiskSerialNumber || '';
            } else {
                return '';
            }
        } catch (error) {
            return '';
        }
    }

    // 获取mac地址
    getMacAddress() {
        try {
            // windows
            if (process.platform === 'win32') {
                const result = execSync('wmic nic get MacAddress /format:value',
                    { encoding: 'utf-8', windowsHide: true });
                // 匹配包含冒号的Mac地址格式，如XX:XX:XX:XX:XX:XX
                const matched = result.match(/MACAddress=([\w:]+)/);
                return matched ? matched[1] : '';
            }
            // mac
            else if (process.platform === 'darwin') {
                const macAddress = execSync('system_profiler SPHardwareDataType | grep "MAC Address" | awk \'{print $4}\'',
                    { encoding: 'utf-8' }).trim();
                return macAddress || '';
            } else {
                return '';
            }
        } catch (error) {
            return '';
        }
    }

    // 获取机器uuid（windows）或 hardware id（mac）
    getMachineUuid() {
        try {
            // windows
            if (process.platform === 'win32') {
                const result = execSync('wmic csproduct get uuid /format:value',
                    { encoding: 'utf-8', windowsHide: true });
                // 匹配包含连字符的UUID格式，如E7C6DAEF-805A-11EA-80DC-002B672C2899
                const matched = result.match(/UUID=([\w-]+)/);
                return matched ? matched[1] : '';
            }
            // mac
            else if (process.platform === 'darwin') {
                const macMachineUuid = execSync('system_profiler SPHardwareDataType | grep "Hardware UUID" | awk \'{print $4}\'',
                    { encoding: 'utf-8' }).trim();
                return macMachineUuid || '';
            } else {
                return '';
            }
        } catch (error) {
            return '';
        }
    }

    // 获取用户主机名
    getUserHostname() {
        try {
            return `${os.userInfo().username}@${os.hostname()}`;
        } catch (error) {
            return '';
        }
    }

    // 生成容错指纹，允许部分硬件变化
    getFaultTolerantFingerprint() {
        const components = this.collectComponents();
        // 给每个组件生成单独的哈希值
        const hashedComponents: Record<keyof MachineFingerprintComponents, string> = {} as any;
        for (const key in components) {
            if (components.hasOwnProperty(key)) {
                const component = components[key as keyof MachineFingerprintComponents];
                hashedComponents[key as keyof MachineFingerprintComponents] = crypto.createHash('md5').update(component).digest('hex');
            }
        }
        return {
            fingerprint: crypto.createHash('sha256').update(JSON.stringify(hashedComponents)).digest('hex'),
            components: hashedComponents,
            count: Object.keys(hashedComponents).length
        }
    }
}

export { MachineFingerprint }