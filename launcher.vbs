' VBScript для запуска Django сервера без видимого окна
' Сохраните этот файл в корневой папке проекта и создайте ярлык на рабочем столе

' Получаем путь к текущей директории скрипта
Set objFSO = CreateObject("Scripting.FileSystemObject")
strScriptPath = objFSO.GetParentFolderName(WScript.ScriptFullName)
Set objShell = CreateObject("WScript.Shell")

' Определяем адрес сервера
strServerHost = "127.0.0.1"
strServerPort = "8000"
strServerURL = "http://" & strServerHost & ":" & strServerPort

' Проверяем, работает ли уже сервер, пытаясь открыть соединение
Function IsServerRunning()
    On Error Resume Next
    Dim objHTTP
    Set objHTTP = CreateObject("MSXML2.XMLHTTP")
    objHTTP.open "HEAD", strServerURL, False
    objHTTP.send
    If objHTTP.Status = 200 Or objHTTP.Status = 302 Or objHTTP.Status = 404 Then
        IsServerRunning = True
    Else
        IsServerRunning = False
    End If
    Set objHTTP = Nothing
    On Error Goto 0
End Function

' Если сервер уже запущен, просто открываем браузер
If IsServerRunning() Then
    objShell.Run strServerURL, 1, False
    WScript.Quit
End If

' Сначала остановим предыдущий процесс Django, если он есть
objShell.Run "taskkill /f /im python.exe", 0, True

' Создаем командную строку для запуска Django с активацией окружения
strCommand = "cmd /c cd /d """ & strScriptPath & _
             """ && call .venv\Scripts\activate.bat && " & _
             "python manage.py runserver " & strServerHost & ":" & strServerPort

' Запускаем команду в полностью скрытом режиме
objShell.Run strCommand, 0, False

' Ждем несколько секунд, чтобы сервер запустился
WScript.Sleep 3000

' Открываем браузер с нужным URL
objShell.Run strServerURL, 1, False