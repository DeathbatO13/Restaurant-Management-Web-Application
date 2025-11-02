Set WshShell = CreateObject("WScript.Shell")
WshShell.Run chr(34) & "app.exe" & Chr(34), 0
Set WshShell = Nothing
