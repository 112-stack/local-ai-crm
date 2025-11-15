' ============================================
' CRM Business Predictor Launcher
' ============================================
' Launches the application and opens browser

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

' Run the batch file (1 = normal window, False = don't wait)
objShell.Run """" & batFile & """", 1, False

' Wait for servers to start (8 seconds)
WScript.Sleep 8000

' Open browser to frontend
objShell.Run "http://localhost:5173"

WScript.Quit 0
