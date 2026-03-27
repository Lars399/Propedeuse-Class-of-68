<button id="fireAlertButton" style="position: absolute; top: 0; left: 0; padding: 10px 20px; background-color: red; color: white; border: none; cursor: pointer;">Trigger Fire Alert</button>

<script>
    document.getElementById('fireAlertButton').addEventListener('click', function() {
        const fireID = Math.floor(Math.random() * 10000);
        alert('Fire Alert Triggered! Fire ID: ' + fireID);
    });
</script>