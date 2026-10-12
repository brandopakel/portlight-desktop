# Compatibility observations

Test date: 2026-10-12. Windows x64; Intel Core i7-13700F; NVIDIA RTX 4060 Ti. AnyPS5 relinker and runtime: ee496219007b05e054a469fe12330f7e38e5451a.

These observations came from the earlier local integration. They do not imply the public download includes game files. All entries retain preparation and launch controls.

| Project | Observed result | Details |
| --- | --- | --- |
| [XashPS5](https://github.com/GordonProsperoMan/xash3d-ps5) | Starts; requires Half-Life data | XashPS5 reports valve/liblist.gam missing and asks for the full valve folder from a Half-Life installation. Process exits with code 0 after diagnostic. |
| [Middle Ages Ping Pong](https://github.com/STL1te/MedievalTennis) | Extraction unavailable | Reconstructed ELF does not match embedded SHA-256 |
| [ccleste](https://github.com/darkxex/PS5_Celeste) | First level rendered through Electron + AnyPS5 | Prepare and Launch clicked in packaged Electron app. Animated title screen and first level rendered; mouse input started level. Brief automated keyboard taps did not establish movement. Sustained gameplay and controller testing remain unverified. |
| [SuperTuxKart](https://github.com/Marice/stk-ps5) | Conversion failed | Clean ELF available. FAIL: Forbidden syscall instruction at code offset 0xe2c3a7 (offset 0xe2c3a7) |
| [The Simpsons Game](https://github.com/LoZazaMastro/TheSimpsonsGame-PS5-Builder) | Extraction unavailable | No packaged executable |
| [PokeMMO Prospero](https://github.com/Shabbypenguin/PokeMMO-Prospero) | Still running after 12 seconds; stopped after test; gameplay unverified | Clean ELF available. No explicit runtime diagnostic; see full log. |
| [ProsperoPuzzles](https://github.com/blackbearreloaded/ProsperoPuzzles) | Runtime startup failure | Converted, then exited with Windows code 3221226505 (0xC0000409). Log stops after transferring control to ELF entry point; no detailed diagnostic. |
| [Yamagi Quake II](https://github.com/blackbearreloaded/ps5-yamagi-quake2) | Still running after 12 seconds; stopped after test; gameplay unverified | Clean ELF available. No explicit runtime diagnostic; see full log. |
| [ProsperoLichess](https://github.com/blackbearreloaded/ProsperoLichess) | Still running after 12 seconds; stopped after test; gameplay unverified | Clean ELF available. No explicit runtime diagnostic; see full log. |
| [vkQuake](https://github.com/mihawk-99/PS5_vkQuake) | Exited at startup; cause undetermined | Converted, then exited with code 0. Log stops after transferring control to ELF entry point. No playable window verified. |
| [Quake3e](https://github.com/griches/PS5_Quake3e) | Starts; requires Quake III Arena data | Game reports: you need to install Quake III Arena in order to play. Its baseq3 data is missing. Windows exit code was 0 despite game reporting status 1. |
| [DOOM Native Port](https://github.com/lowbit/ps5-doom) | DOOM renders; physical keyboard response confirmed | Prepare and Launch clicked in packaged Electron app. Shareware selection, episode menu and rendered 3D world observed. User confirmed physical keyboard menus respond. Startup/input smoke test, not full-game validation. |
| [OpenRCT2 Native Port](https://github.com/lowbit/ps5-openrct2) | Still running after 12 seconds; stopped after test; gameplay unverified | Clean ELF available. No explicit runtime diagnostic; see full log. |

A 12-second running process is a startup observation only. The batch processes were stopped after that interval. No full playthrough, audio validation or physical controller test was completed.

The ELF experiment recovered 11 clean game executables. Ten converted; SuperTuxKart failed on a direct syscall at offset 0xe2c3a7. Middle Ages Ping Pong failed reconstructed-hash verification. The Simpsons archive had no packaged executable.
