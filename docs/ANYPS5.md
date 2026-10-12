# AnyPS5 setup

AnyPS5 is an external tool, not an embedded Portlight component. Obtain or build it from https://github.com/boykopovar/AnyPS5 and follow its [build instructions](https://github.com/boykopovar/AnyPS5/blob/main/docs/dev/BUILD.md). Consult the repository's current README if a documentation path changes.

The local game tests used commit `ee496219007b05e054a469fe12330f7e38e5451a`, with the relinker and all runtime libraries built from that same revision using WinLibs GCC 15.2.0. The older v0.1.1 release failed on the tested bundled libc inputs. Portlight itself is not tied to one relinker checksum: Configure AnyPS5 records the tool you choose and detects later changes.

Choose the relinker executable, then the runtime `libs` directory containing AnyPS5's Windows `.prx` libraries and their required DLL dependencies. Configure validates the executable format and that the folder contains libraries; it cannot prove all libraries are mutually compatible. Keep tool/runtime revisions matched.

Preparation invokes:

```text
relinker --windows [--to-intel] --registry input.elf output.exe
```

`--to-intel` is selected on CPUs identified as Intel. Preparation accepts a clean little-endian x86-64 ELF, including a file named eboot.bin whose contents are actually ELF. SELF, PKG and archive containers are not ELF inputs. The public app does not decrypt or unpack those containers.

Keep a dedicated source folder with the ELF, game resources, and any bundled clean modules in `sce_module`, `sce_modules`, or `prx`. The launcher makes a new preparation folder and copies resources to `app0`, with the configured system libraries in `libs`. A preparation failure preserves an existing attached executable and retains its diagnostic log. Linked source paths are rejected to keep copying within explicit game folders.

The earlier plaintext homebrew recovery experiment is documented as evidence, not distributed as a game package or recovery utility in this release. It did not establish permission to redistribute the recovered modules.

The local AnyPS5 build used one build-system-only libusb change to generate its frozen version header through PowerShell when MSYS was unavailable. No AnyPS5 emulator/porting behavior change is claimed as a Portlight contribution.
