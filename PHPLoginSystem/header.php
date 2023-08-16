<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
    session_regenerate_id();
}
?>

<nav>
    <div class="nav-wrapper">
        <a href="index.php" class="logo-link">Test Site</a>
        <ul>
            <li><a href="index.php">Home</a></li>
            <li><a href="discover.php">About us</a></li>
            <?php
                if(isset($_SESSION["uid"])) {
                    echo '<li><a href="profile.php">Profile Page</a></li>';
                    echo '<li><a href="./includes/logout.inc.php">Logout</a></li>';
                } else {
                    echo '<li><a href="signup.php">Sign up</a></li>';
                    echo '<li><a href="login.php">Login</a></li>';
                }
            ?>
            
        </ul>
    </div>
</nav>

<script>
// Make class name 'current' to the nav link currently being visited
for (var i = 0; i < document.links.length; i++) {
    if (document.links[i].href === document.URL && document.links[i].className != 'logo-link') {
        document.links[i].className = 'current';
    }
}
</script>