/* *****************************************************************************
 * Description:  The purpose of this exercise is to practice with StdDraw,
 *               animations and printf.
 *
 *               This exercise demonstrates N bouncing balls, where the value
 *               for N and the filename for the ball image are provided on the
 *               command-line.
 *
 *               java-introcs 1 beach-ball.png
 *               java-introcs 25 tennis-ball.png
 *               java-introcs 100 meatball.png
 *
 **************************************************************************** */

public class BouncingBallsDeluxe {
    // Program to animate N bouncing balls
    public static void main(String[] args) {
        // get the number of bouncing balls fromn the command line
        int n = Integer.parseInt(args[0]);

        // create four parallel arrays to represent
        // each ball location and velocity
        double[] rx = new double[n];
        double[] ry = new double[n];
        double[] vx = new double[n];
        double[] vy = new double[n];
        String ballImage = args[1];
        double radius = 0.1;

        // provide random values for initial
        // location and velocity
        for (int i = 0; i < n; i++) {
            rx[i] = Math.random() * 1.5 - 0.75;
            ry[i] = Math.random() * 1.5 - 0.75;
            vx[i] = Math.random() * 0.06 - 0.03;
            vy[i] = Math.random() * 0.06 - 0.03;
        }

        // print the column headings
        StdOut.printf("%3s: %9s %9s %9s %9s\n",
                      "i", "rx", "ry", "vx", "vy");
        // print the initial values for each ball, e.g.
        //    0:    0.3515    0.6842   -0.0271    0.0250
        for (int i = 0; i < n; i++)
            StdOut.printf("%3d: %9.4f %9.4f %9.4f %9.4f\n",
                          i, rx[i], ry[i], vx[i], vy[i]);

        // initialize standard drawing - see BouncingBallDeluxe.java
        StdDraw.setScale(-1.0, 1.0);
        StdDraw.enableDoubleBuffering();
        StdAudio.startBackgroundPlayback();


        // clear the screen
        StdDraw.clear(StdDraw.BOOK_LIGHT_BLUE);

        // main animation loop
        while (true) {
            // update position for each ball
            for (int i = 0; i < n; i++) {
                rx[i] = rx[i] + vx[i];
                ry[i] = ry[i] + vy[i];
            }
            // bounce off wall according to law of elastic collision
            for (int i = 0; i < n; i++) {
                if (Math.abs(rx[i]) + radius > 1.0) {
                    vx[i] = -vx[i];
                    StdAudio.playInBackground("BallTap.wav");
                }

                if (Math.abs(ry[i]) + radius > 1.0) {
                    vy[i] = -vy[i];
                    StdAudio.playInBackground("BlockHit.wav");
                }
            }

            // set the background to light blue
            StdDraw.clear(StdDraw.BOOK_LIGHT_BLUE);

            // draw each ball
            for (int i = 0; i < n; i++)
                StdDraw.picture(rx[i], ry[i], ballImage, 2 * radius, 2 * radius);

            // display and pause for 20ms
            StdDraw.show(); // double buffer is enabled
            StdDraw.pause(20);
        }
    }
}
