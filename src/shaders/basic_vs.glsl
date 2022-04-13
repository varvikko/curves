attribute vec4 vertexPosition;

uniform mat4 modelViewMat;
uniform mat4 orthogonalMat;

void main()
{
  gl_Position = orthogonalMat * modelViewMat * vertexPosition;
}

