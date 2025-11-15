' ============================================
' Silent Launcher for CRM Business Predictor
' ============================================
' This VBScript launches the application without showing command windows

Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

' Get the script directory
scriptDir = objFSO.GetParentFolderName(WScript.ScriptFullName)

' Path to the batch file
batFile = scriptDir & "\auto-run.bat"

' Check if batch file exists
If Not objFSO.FileExists(batFile) Then
    MsgBox "Error: auto-run.bat not found!" & vbCrLf & vbCrLf & _
           "Expected location:" & vbCrLf & batFile, _
           vbCritical, "CRM Launcher - Error"
    WScript.Quit 1
End If

' Run the batch file hidden (0 = hidden window)
' Wait = False means don't wait for it to complete
objShell.Run """" & batFile & """", 0, False

' Show notification (optional - comment out if not desired)
WScript.Sleep 2000
MsgBox "CRM Business Predictor is starting..." & vbCrLf & vbCrLf & _
       "Backend: http://localhost:8000" & vbCrLf & _
       "Frontend: http://localhost:5173" & vbCrLf & vbCrLf & _
       "Check the system tray for server windows.", _
       vbInformation, "CRM Launcher"

WScript.Quit 0
