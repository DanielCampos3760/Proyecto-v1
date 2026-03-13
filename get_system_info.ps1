# get_system_info.ps1 - Versión Definitiva
try {
    Add-Type -AssemblyName System.Windows.Forms
    $screens = [System.Windows.Forms.Screen]::AllScreens | Where-Object { $_.DeviceName -notmatch "Parsec" }
    
    $monitorList = $screens | ForEach-Object {
        $devName = $_.DeviceName.Replace('\\.\DISPLAY', 'Monitor ')
        "$devName : $($_.Bounds.Width)x$($_.Bounds.Height)"
    }
} catch {
    $monitorList = "Monitor Principal"
}

$systemInfo = @{
    ComputerName = $env:COMPUTERNAME
    Processor    = (Get-WmiObject Win32_Processor).Name.Trim()
    RAM_GB       = [math]::Round((Get-WmiObject Win32_PhysicalMemory | Measure-Object -Property Capacity -Sum).Sum / 1GB)
    GPU          = (Get-WmiObject Win32_VideoController | Where-Object { $_.Name -notmatch "Parsec" } | Select-Object -ExpandProperty Name) -join ", "
    Monitors     = $monitorList
    Peripherals  = Get-PnpDevice -PresentOnly | Where-Object { $_.Class -match "Mouse|Keyboard|Media" -and $_.FriendlyName -notmatch "Parsec" } | Select-Object FriendlyName | Sort-Object FriendlyName -Unique
    AudioDevices = Get-WmiObject Win32_SoundDevice | Where-Object { $_.Name -notmatch "Parsec" } | Select-Object Name | Sort-Object Name -Unique
}

$systemInfo | ConvertTo-Json -Depth 4 | Out-File -FilePath "system_context.json" -Encoding UTF8