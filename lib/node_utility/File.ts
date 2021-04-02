import * as Path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';

export class File {

    static sep = Path.sep;
    static delimiter = Path.delimiter;
    static EMPTY_FILTER: RegExp[] = [];

    readonly name: string;          // example 'demo.cpp'
    readonly noSuffixName: string;  // example 'demo'
    readonly suffix: string;        // example '.cpp'
    readonly dir: string;           // example 'd:\\dir'
    readonly path: string;          // example 'd:\\dir\\demo.cpp'

    constructor(fPath: string) {
        this.path = fPath;
        this.name = Path.basename(fPath);
        this.noSuffixName = this.GetNoSuffixName(this.name);
        this.suffix = Path.extname(fPath);
        this.dir = Path.dirname(fPath);
    }

    static fromArray(pathArray: string[]): File {
        return new File(pathArray.join(File.sep));
    }

    static ToUnixPath(path: string): string {
        return Path.normalize(path).replace(/\\{1,}/g, '/');
    }

    static ToUri(path: string): string {
        return 'file://' + this.ToNoProtocolUri(path);
    }

    static ToNoProtocolUri(path: string): string {
        return '/' + encodeURIComponent(path.replace(/\\/g, '/'));
    }

    // c:/abcd/../a -> c:\abcd\..\a
    static ToLocalPath(path: string): string {

        const res = File.ToUnixPath(path);

        if (File.sep === '\\') {
            return res.replace(/\//g, File.sep);
        }

        return res;
    }
    /* 
        // ./././aaaa/././././bbbb => ./aaaa/bbbb
        private static DelRepeatedPath(_path: string) {
    
            let path = _path;
    
            // delete '..' of path
            let parts = path.split('/');
            let index = -1;
            while ((index = parts.indexOf('..')) > 0) {
                parts.splice(index - 1, 2);
            }
    
            // delete '.' of path
            path = parts.join('/').replace(/\/\.(?=\/)/g, '');
    
            return path;
        }
     */
    private static _match(str: string, isInverter: boolean, regList: RegExp[]): boolean {

        let isMatch: boolean = false;

        for (let reg of regList) {
            if (reg.test(str)) {
                isMatch = true;
                break;
            }
        }

        if (isInverter) {
            isMatch = !isMatch;
        }

        return isMatch;
    }

    private static _filter(fList: File[], isInverter: boolean, fileFilter?: RegExp[], dirFilter?: RegExp[]): File[] {

        const res: File[] = [];

        if (fileFilter) {
            fList.forEach(f => {
                if (f.IsFile() && this._match(f.name, isInverter, fileFilter)) {
                    res.push(f);
                }
            });
        } else {
            fList.forEach(f => {
                if (f.IsFile()) {
                    res.push(f);
                }
            });
        }

        if (dirFilter) {
            fList.forEach(f => {
                if (f.IsDir() && this._match(f.name, isInverter, dirFilter)) {
                    res.push(f);
                }
            });
        } else {
            fList.forEach(f => {
                if (f.IsDir()) {
                    res.push(f);
                }
            });
        }

        return res;
    }

    static Filter(fList: File[], fileFilter?: RegExp[], dirFilter?: RegExp[]): File[] {
        return this._filter(fList, false, fileFilter, dirFilter);
    }

    static NotMatchFilter(fList: File[], fileFilter?: RegExp[], dirFilter?: RegExp[]): File[] {
        return this._filter(fList, true, fileFilter, dirFilter);
    }

    private GetNoSuffixName(name: string): string {
        const nList = this.name.split('.');
        if (nList.length > 1) {
            nList.pop();
            return nList.join('.');
        } else {
            return name;
        }
    }

    private _CopyRetainDir(baseDir: File, file: File) {

        const relativePath = baseDir.ToRelativePath(file.dir);

        if (relativePath) {

            const dir = File.fromArray([this.path, relativePath.replace(/\//g, File.sep)]);
            if (!dir.IsDir()) {
                this.CreateDir(true);
            }
            fs.copyFileSync(file.path, dir.path + File.sep + file.name);
        }
    }

    /**
     * example: this.path: 'd:\app\abc\.', absPath: 'd:\app\abc\.\def\a.c', result: '.\def\a.c'
    */
    ToRelativePath(abspath: string, hasPrefix: boolean = true): string | undefined {

        if (!Path.isAbsolute(abspath)) {
            return undefined;
        }

        const rePath = Path.relative(this.path, abspath);
        if (Path.isAbsolute(rePath)) {
            return undefined;
        }

        return hasPrefix ? (`.${File.sep}${rePath}`) : rePath;
    }

    //----------------------------------------------------

    CreateDir(recursive: boolean = false): void {
        if (!this.IsDir()) {
            if (recursive) {
                let list = this.path.split(Path.sep);
                let f: File;
                if (list.length > 0) {
                    let dir: string = list[0];
                    for (let i = 0; i < list.length;) {
                        f = new File(dir);
                        if (!f.IsDir()) {
                            fs.mkdirSync(f.path);
                        }
                        dir += ++i < list.length ? (Path.sep + list[i]) : '';
                    }
                    return;
                }
                return;
            }
            fs.mkdirSync(this.path);
        }
    }

    GetList(fileFilter?: RegExp[], dirFilter?: RegExp[]): File[] {
        let list: File[] = [];
        fs.readdirSync(this.path).forEach((str: string) => {
            if (str !== '.' && str !== '..') {
                const f = new File(this.path + Path.sep + str);
                if (f.IsDir()) {
                    if (dirFilter) {
                        for (let reg of dirFilter) {
                            if (reg.test(f.name)) {
                                list.push(f);
                                break;
                            }
                        }
                    } else {
                        list.push(f);
                    }
                } else {
                    if (fileFilter) {
                        for (let reg of fileFilter) {
                            if (reg.test(f.name)) {
                                list.push(f);
                                break;
                            }
                        }
                    } else {
                        list.push(f);
                    }
                }
            }
        });
        return list;
    }

    GetAll(fileFilter?: RegExp[], dirFilter?: RegExp[]): File[] {
        let res: File[] = [];

        let fStack: File[] = this.GetList(fileFilter);
        let f: File;

        while (fStack.length > 0) {
            f = <File>fStack.pop();
            if (f.IsDir()) {
                fStack = fStack.concat(f.GetList(fileFilter));
            }
            res.push(f);
        }

        return File.Filter(res, undefined, dirFilter);
    }

    CopyRetainDir(baseDir: File, file: File) {
        this._CopyRetainDir(baseDir, file);
    }

    CopyFile(file: File) {
        fs.copyFileSync(file.path, this.path + File.sep + file.name);
    }

    CopyList(dir: File, fileFilter?: RegExp[], dirFilter?: RegExp[]) {
        let fList = dir.GetList(fileFilter, dirFilter);
        fList.forEach(f => {
            if (f.IsFile()) {
                this.CopyRetainDir(dir, f);
            }
        });
    }

    CopyAll(dir: File, fileFilter?: RegExp[], dirFilter?: RegExp[]) {
        let fList = dir.GetAll(fileFilter, dirFilter);
        fList.forEach(f => {
            if (f.IsFile()) {
                this.CopyRetainDir(dir, f);
            }
        });
    }

    //-------------------------------------------------

    Read(encoding?: string): string {
        return fs.readFileSync(this.path, encoding || 'utf8');
    }

    Write(str: string, options?: fs.WriteFileOptions) {
        fs.writeFileSync(this.path, str, options);
    }

    IsExist(): boolean {
        return fs.existsSync(this.path);
    }

    IsFile(): boolean {
        if (fs.existsSync(this.path)) {
            return fs.lstatSync(this.path).isFile();
        }
        return false;
    }

    IsDir(): boolean {
        if (fs.existsSync(this.path)) {
            return fs.lstatSync(this.path).isDirectory();
        }
        return false;
    }

    getHash(hashName?: string): string {
        const hash = crypto.createHash(hashName || 'md5');
        hash.update(fs.readFileSync(this.path));
        return hash.digest('hex');
    }

    getSize(): number {
        return fs.statSync(this.path).size;
    }

    ToUri(): string {
        return 'file://' + this.ToNoProtocolUri();
    }

    ToNoProtocolUri(): string {
        return '/' + encodeURIComponent(this.path.replace(/\\/g, '/'));
    }
}