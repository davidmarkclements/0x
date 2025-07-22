import {ChildProcess} from 'child_process'

export = zeroEks;

declare type Args = {
    argv: string[],
    workingDir?: string,
    pathToNodeBinary?: string,
    name?: string,
    onPort?: string,
    title?: string,
    visualizeOnly?: string,
    collectOnly?: boolean,
    collectDelay?: number,
    mapFrames?: (frames: any, profiler: any) => Array | false,
    onProcessExit?: () => void,
    status?: (msg: any) => void,
    kernelTracing?: boolean,
    outputDir?: string,
    outputHtml?: string,
    treeDebug?: boolean,
    kernelTracingDebug?: boolean,
    env?: Record<string, string>,
    onProcessStart?: (process: ChildProcess) => void
}

declare function zeroEks(args: Args): Promise<string>;
