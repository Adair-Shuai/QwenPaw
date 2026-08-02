!include LogicLib.nsh
!include nsDialogs.nsh

Var QwenPawCliPathCheckbox
Var QwenPawCliPathState
Var QwenPawScienceCheckbox
Var QwenPawScienceState
Var QwenPawWhisperCheckbox
Var QwenPawWhisperState
Var QwenPawOptionalPageInitialized
Var QwenPawExecutionBuiltinRadio
Var QwenPawExecutionExternalRadio
Var QwenPawExecutionPythonText
Var QwenPawExecutionPythonBrowse
Var QwenPawExecutionMode
Var QwenPawExecutionPythonPath
Var QwenPawExecutionPageInitialized

Page custom QWENPAW_EXECUTION_RUNTIME_PAGE QWENPAW_EXECUTION_RUNTIME_PAGE_LEAVE
Page custom QWENPAW_OPTIONAL_COMPONENTS_PAGE QWENPAW_OPTIONAL_COMPONENTS_PAGE_LEAVE
Page custom QWENPAW_CLI_PATH_PAGE QWENPAW_CLI_PATH_PAGE_LEAVE

!macro QWENPAW_WRITE_EXECUTION_RUNTIME
  CreateDirectory "$INSTDIR\execution-runtime"
  FileOpen $0 "$INSTDIR\execution-runtime\selection.txt" w
  FileWrite $0 "$QwenPawExecutionMode$\r$\n"
  ${If} $QwenPawExecutionMode == "external"
    FileWrite $0 "$QwenPawExecutionPythonPath$\r$\n"
  ${EndIf}
  FileClose $0
!macroend

Function QWENPAW_LOAD_EXECUTION_RUNTIME_SELECTION
  StrCpy $QwenPawExecutionMode "builtin"
  IfFileExists "$INSTDIR\execution-runtime\selection.txt" 0 qwenpaw_execution_selection_done
  FileOpen $0 "$INSTDIR\execution-runtime\selection.txt" r
  FileRead $0 $1
  ; Strip trailing $\r$\n written by QWENPAW_WRITE_EXECUTION_RUNTIME
  StrCpy $1 $1 -2
  ${If} $1 == "external"
    FileRead $0 $1
    StrCpy $QwenPawExecutionPythonPath $1 -2
    IfFileExists "$QwenPawExecutionPythonPath" 0 +2
    StrCpy $QwenPawExecutionMode "external"
  ${EndIf}
  FileClose $0
  qwenpaw_execution_selection_done:
FunctionEnd

!macro QWENPAW_QUEUE_SELECTED_COMPONENTS
  CreateDirectory "$INSTDIR\optional-components"
  FileOpen $0 "$INSTDIR\optional-components\pending.txt" w
  ${If} $QwenPawExecutionMode != "external"
  ${AndIf} $QwenPawScienceState != 0
    FileWrite $0 "science$\r$\n"
    DetailPrint "$(qwenpawOptionalQueued) $(qwenpawOptionalScienceName)"
  ${EndIf}
  ${If} $QwenPawWhisperState != 0
    FileWrite $0 "whisper$\r$\n"
    DetailPrint "$(qwenpawOptionalQueued) $(qwenpawOptionalWhisperName)"
  ${EndIf}
  FileClose $0
!macroend

Function QWENPAW_EXECUTION_RUNTIME_UPDATE_CONTROLS
  ${NSD_GetState} $QwenPawExecutionExternalRadio $0
  ${If} $0 == ${BST_CHECKED}
    StrCpy $QwenPawExecutionMode "external"
    EnableWindow $QwenPawExecutionPythonText 1
    EnableWindow $QwenPawExecutionPythonBrowse 1
  ${Else}
    StrCpy $QwenPawExecutionMode "builtin"
    EnableWindow $QwenPawExecutionPythonText 0
    EnableWindow $QwenPawExecutionPythonBrowse 0
  ${EndIf}
FunctionEnd

Function QWENPAW_EXECUTION_RUNTIME_UPDATE_PATH
  ${NSD_GetText} $QwenPawExecutionPythonText $QwenPawExecutionPythonPath
FunctionEnd

Function QWENPAW_EXECUTION_RUNTIME_BROWSE
  nsDialogs::SelectFileDialog open "$QwenPawExecutionPythonPath" "Python executable|*.exe"
  Pop $0
  ${If} $0 != ""
    StrCpy $QwenPawExecutionPythonPath $0
    ${NSD_SetText} $QwenPawExecutionPythonText $0
  ${EndIf}
FunctionEnd

Function QWENPAW_EXECUTION_RUNTIME_PAGE
  ${If} $QwenPawExecutionPageInitialized == ""
    StrCpy $QwenPawExecutionPageInitialized 1
    Call QWENPAW_LOAD_EXECUTION_RUNTIME_SELECTION
  ${EndIf}
  ${If} ${Silent}
    Abort
  ${EndIf}
  ${GetOptions} $CMDLINE "/P" $0
  ${IfNot} ${Errors}
    Abort
  ${EndIf}

  ${If} $QwenPawExecutionPythonPath == ""
    SearchPath $QwenPawExecutionPythonPath "python.exe"
  ${EndIf}

  nsDialogs::Create 1018
  Pop $0
  ${If} $0 == error
    Abort
  ${EndIf}

  !insertmacro MUI_HEADER_TEXT "$(qwenpawExecutionPageTitle)" "$(qwenpawExecutionPageSubtitle)"
  ${NSD_CreateLabel} 0 0 100% 28u "$(qwenpawExecutionPageDescription)"
  Pop $0
  ${NSD_CreateRadioButton} 0 38u 100% 12u "$(qwenpawExecutionBuiltinRadio)"
  Pop $QwenPawExecutionBuiltinRadio
  ${NSD_CreateLabel} 14u 54u 94% 20u "$(qwenpawExecutionBuiltinDescription)"
  Pop $0
  ${NSD_CreateRadioButton} 0 82u 100% 12u "$(qwenpawExecutionExternalRadio)"
  Pop $QwenPawExecutionExternalRadio
  ${NSD_CreateLabel} 14u 98u 94% 20u "$(qwenpawExecutionExternalDescription)"
  Pop $0
  ${NSD_CreateText} 14u 124u 76% 13u "$QwenPawExecutionPythonPath"
  Pop $QwenPawExecutionPythonText
  ${NSD_CreateBrowseButton} 82% 123u 18% 15u "$(qwenpawExecutionBrowse)"
  Pop $QwenPawExecutionPythonBrowse
  ${NSD_OnClick} $QwenPawExecutionBuiltinRadio QWENPAW_EXECUTION_RUNTIME_UPDATE_CONTROLS
  ${NSD_OnClick} $QwenPawExecutionExternalRadio QWENPAW_EXECUTION_RUNTIME_UPDATE_CONTROLS
  ${NSD_OnClick} $QwenPawExecutionPythonBrowse QWENPAW_EXECUTION_RUNTIME_BROWSE
  ${NSD_OnChange} $QwenPawExecutionPythonText QWENPAW_EXECUTION_RUNTIME_UPDATE_PATH

  ${If} $QwenPawExecutionMode == "external"
    ${NSD_Check} $QwenPawExecutionExternalRadio
  ${Else}
    ${NSD_Check} $QwenPawExecutionBuiltinRadio
  ${EndIf}
  Call QWENPAW_EXECUTION_RUNTIME_UPDATE_CONTROLS
  nsDialogs::Show
FunctionEnd

Function QWENPAW_EXECUTION_RUNTIME_PAGE_LEAVE
  ${NSD_GetState} $QwenPawExecutionExternalRadio $0
  ${If} $0 != ${BST_CHECKED}
    StrCpy $QwenPawExecutionMode "builtin"
    Return
  ${EndIf}

  ${NSD_GetText} $QwenPawExecutionPythonText $QwenPawExecutionPythonPath
  IfFileExists "$QwenPawExecutionPythonPath" 0 qwenpaw_execution_python_invalid
  StrCpy $QwenPawExecutionMode "external"
  Return

  qwenpaw_execution_python_invalid:
  MessageBox MB_OK|MB_ICONEXCLAMATION "$(qwenpawExecutionInvalid)"
  Abort
FunctionEnd

!macro QWENPAW_UPDATE_CLI_PATH ACTION
  InitPluginsDir
  File /oname=$PLUGINSDIR\qwenpaw-update-path.ps1 "..\..\..\..\nsis\update-qwenpaw-path.ps1"
  nsExec::ExecToStack `powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$PLUGINSDIR\qwenpaw-update-path.ps1" -Action "${ACTION}" -Path "$INSTDIR\binaries\python-runtime\python\Scripts"`
  Pop $0
  Pop $1
!macroend

!macro QWENPAW_ADD_CLI_PATH_IF_SELECTED
  ${If} $QwenPawCliPathState == 0
    DetailPrint "$(qwenpawCliPathSkipped)"
  ${Else}
    IfFileExists "$INSTDIR\binaries\python-runtime\python\Scripts\qwenpaw.exe" 0 qwenpaw_cli_path_missing
    !insertmacro QWENPAW_UPDATE_CLI_PATH "Add"
    ${If} $0 == 0
      DetailPrint "$(qwenpawCliPathAdded)"
    ${Else}
      DetailPrint "$(qwenpawCliPathUpdateFailed)"
      DetailPrint "$1"
    ${EndIf}
    Goto qwenpaw_cli_path_done
    qwenpaw_cli_path_missing:
      DetailPrint "$(qwenpawCliPathMissing)"
    qwenpaw_cli_path_done:
  ${EndIf}
!macroend

!macro QWENPAW_REMOVE_CLI_PATH
  !insertmacro QWENPAW_UPDATE_CLI_PATH "Remove"
  ${If} $0 != 0
    DetailPrint "$(qwenpawCliPathUpdateFailed)"
    DetailPrint "$1"
  ${EndIf}
!macroend

!macro QWENPAW_REMOVE_LEGACY_CLI_PATH
  InitPluginsDir
  File /oname=$PLUGINSDIR\qwenpaw-update-legacy-path.ps1 "..\..\..\..\nsis\update-qwenpaw-path.ps1"
  nsExec::ExecToStack `powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$PLUGINSDIR\qwenpaw-update-legacy-path.ps1" -Action "Remove" -Path "$INSTDIR\binaries\qwenpaw-backend"`
  Pop $0
  Pop $1
  ${If} $0 != 0
    DetailPrint "$(qwenpawCliPathUpdateFailed)"
    DetailPrint "$1"
  ${EndIf}
!macroend

!macro QWENPAW_INSTALL_DEBUG_LAUNCHER
  SetOutPath "$INSTDIR"
  File /oname=qwenpaw-desktop-debug.cmd "..\..\..\..\nsis\qwenpaw-desktop-debug.cmd"
  File /oname=qwenpaw-desktop-debug.ps1 "..\..\..\..\nsis\qwenpaw-desktop-debug.ps1"
  CreateShortcut "$SMPROGRAMS\UGSci Desktop (Debug).lnk" "$INSTDIR\qwenpaw-desktop-debug.cmd" "" "$INSTDIR\qwenpaw-desktop.exe" 0
!macroend

!macro QWENPAW_REMOVE_DEBUG_LAUNCHER
  Delete "$SMPROGRAMS\UGSci Desktop (Debug).lnk"
  Delete "$INSTDIR\qwenpaw-desktop-debug.cmd"
  Delete "$INSTDIR\qwenpaw-desktop-debug.ps1"
!macroend

Function QWENPAW_CLI_PATH_PAGE
  ${GetOptions} $CMDLINE "/NO_QWENPAW_PATH" $0
  ${IfNot} ${Errors}
    StrCpy $QwenPawCliPathState 0
    Abort
  ${EndIf}

  ${GetOptions} $CMDLINE "/P" $0
  ${IfNot} ${Errors}
    StrCpy $QwenPawCliPathState 1
    Abort
  ${EndIf}

  ${If} ${Silent}
    StrCpy $QwenPawCliPathState 1
    Abort
  ${EndIf}

  nsDialogs::Create 1018
  Pop $0
  ${If} $0 == error
    Abort
  ${EndIf}

  !insertmacro MUI_HEADER_TEXT "$(qwenpawCliPathPageTitle)" "$(qwenpawCliPathPageSubtitle)"
  ${NSD_CreateLabel} 0 0 100% 28u "$(qwenpawCliPathPageDescription)"
  Pop $0
  ${NSD_CreateCheckbox} 0 44u 100% 12u "$(qwenpawCliPathCheckbox)"
  Pop $QwenPawCliPathCheckbox

  ${If} $QwenPawCliPathState == 0
    SendMessage $QwenPawCliPathCheckbox ${BM_SETCHECK} 0 0
  ${Else}
    SendMessage $QwenPawCliPathCheckbox ${BM_SETCHECK} 1 0
  ${EndIf}

  nsDialogs::Show
FunctionEnd

Function QWENPAW_CLI_PATH_PAGE_LEAVE
  ${NSD_GetState} $QwenPawCliPathCheckbox $QwenPawCliPathState
FunctionEnd

Function QWENPAW_OPTIONAL_COMPONENTS_PAGE
  ${If} $QwenPawOptionalPageInitialized == ""
    StrCpy $QwenPawOptionalPageInitialized 1
    StrCpy $QwenPawScienceState 0
    StrCpy $QwenPawWhisperState 0

    ${GetOptions} $CMDLINE "/WITH_SCIENCE" $0
    ${IfNot} ${Errors}
      StrCpy $QwenPawScienceState 1
    ${EndIf}
    ${GetOptions} $CMDLINE "/WITH_WHISPER" $0
    ${IfNot} ${Errors}
      StrCpy $QwenPawWhisperState 1
    ${EndIf}
  ${EndIf}

  ${If} ${Silent}
    Abort
  ${EndIf}
  ${GetOptions} $CMDLINE "/P" $0
  ${IfNot} ${Errors}
    Abort
  ${EndIf}
  ${GetOptions} $CMDLINE "/NO_OPTIONAL_COMPONENTS" $0
  ${IfNot} ${Errors}
    Abort
  ${EndIf}

  nsDialogs::Create 1018
  Pop $0
  ${If} $0 == error
    Abort
  ${EndIf}

  !insertmacro MUI_HEADER_TEXT "$(qwenpawOptionalPageTitle)" "$(qwenpawOptionalPageSubtitle)"
  ${NSD_CreateLabel} 0 0 100% 28u "$(qwenpawOptionalPageDescription)"
  Pop $0
  ${NSD_CreateCheckbox} 0 40u 100% 12u "$(qwenpawOptionalScienceCheckbox)"
  Pop $QwenPawScienceCheckbox
  ${NSD_CreateLabel} 14u 56u 94% 22u "$(qwenpawOptionalScienceDescription)"
  Pop $0
  ${NSD_CreateCheckbox} 0 86u 100% 12u "$(qwenpawOptionalWhisperCheckbox)"
  Pop $QwenPawWhisperCheckbox
  ${NSD_CreateLabel} 14u 102u 94% 26u "$(qwenpawOptionalWhisperDescription)"
  Pop $0

  ${If} $QwenPawOptionalPageInitialized == 1
    SendMessage $QwenPawScienceCheckbox ${BM_SETCHECK} 1 0
    StrCpy $QwenPawOptionalPageInitialized 2
  ${Else}
    SendMessage $QwenPawScienceCheckbox ${BM_SETCHECK} $QwenPawScienceState 0
  ${EndIf}
  SendMessage $QwenPawWhisperCheckbox ${BM_SETCHECK} $QwenPawWhisperState 0
  ${If} $QwenPawExecutionMode == "external"
    SendMessage $QwenPawScienceCheckbox ${BM_SETCHECK} 0 0
    EnableWindow $QwenPawScienceCheckbox 0
    StrCpy $QwenPawScienceState 0
  ${EndIf}

  nsDialogs::Show
FunctionEnd

Function QWENPAW_OPTIONAL_COMPONENTS_PAGE_LEAVE
  ${NSD_GetState} $QwenPawScienceCheckbox $QwenPawScienceState
  ${NSD_GetState} $QwenPawWhisperCheckbox $QwenPawWhisperState
FunctionEnd

!macro QWENPAW_STOP_BACKEND_SIDECAR
  ; The Python backend is a Tauri sidecar, not a user-facing window. A leftover
  ; (possibly orphaned, see #5550) backend keeps Python ``.pyd`` modules
  ; memory-mapped, which locks them on Windows. The installer then fails to
  ; overwrite those files and shows the cryptic native "can't write file"
  ; abort/retry/ignore dialog.
  ;
  ; The helper stops only backend processes whose executable lives under
  ; $INSTDIR, so a coexisting QwenPaw install is left untouched. It is
  ; ConstrainedLanguage-safe (WDAC/AppLocker): no ``[System.*]`` static calls,
  ; which throw in that mode and made the previous helper give up silently. It
  ; exits non-zero while a scoped backend is still running; if that persists we
  ; surface a friendly retry prompt rather than the raw OS dialog.
  Push $0
  InitPluginsDir
  File /oname=$PLUGINSDIR\qwenpaw-stop-backend-sidecar.ps1 "..\..\..\..\nsis\stop-backend-sidecar.ps1"
  ${Do}
    nsExec::Exec `powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$PLUGINSDIR\qwenpaw-stop-backend-sidecar.ps1" -InstallDir "$INSTDIR"`
    Pop $0
    ${If} $0 == 0
      ${ExitDo}
    ${EndIf}
    ; Still running (or could not be stopped). Ask the user; default to Cancel
    ; for silent installs.
    MessageBox MB_RETRYCANCEL|MB_ICONEXCLAMATION "$(qwenpawStopBackendPrompt)" /SD IDCANCEL IDRETRY +2
    Quit
  ${Loop}
  Pop $0
!macroend

!macro NSIS_HOOK_PREINSTALL
  !insertmacro QWENPAW_STOP_BACKEND_SIDECAR
  ; Pre-dedup releases stored a complete PyInstaller environment here. NSIS
  ; overwrites payload files but does not guarantee removal of obsolete files,
  ; so explicitly remove it after all scoped backend processes have stopped.
  RMDir /r "$INSTDIR\binaries\qwenpaw-backend"
!macroend

!macro NSIS_HOOK_POSTINSTALL
  ${If} $QwenPawExecutionMode == ""
    StrCpy $QwenPawExecutionMode "builtin"
  ${EndIf}
  !insertmacro QWENPAW_REMOVE_LEGACY_CLI_PATH
  !insertmacro QWENPAW_ADD_CLI_PATH_IF_SELECTED
  !insertmacro QWENPAW_WRITE_EXECUTION_RUNTIME
  !insertmacro QWENPAW_QUEUE_SELECTED_COMPONENTS
  !insertmacro QWENPAW_INSTALL_DEBUG_LAUNCHER
!macroend

!macro NSIS_HOOK_PREUNINSTALL
  !insertmacro QWENPAW_STOP_BACKEND_SIDECAR
  !insertmacro QWENPAW_REMOVE_DEBUG_LAUNCHER
  !insertmacro QWENPAW_REMOVE_CLI_PATH
  !insertmacro QWENPAW_REMOVE_LEGACY_CLI_PATH
!macroend
