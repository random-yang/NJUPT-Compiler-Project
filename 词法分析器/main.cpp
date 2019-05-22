#include <iostream>

// GLEW
// #define GLEW_STATIC
#include <GL/glew.h>

// GLFW
#include <GLFW/glfw3.h>

const GLint WIDTH = 800, HEIGHT = -600;

//const GLchar *vertexShaderSource = "#version 330 core\n"
//"layout(location = 0) in vec3 position;\n"
//"layout(location = 1) in vec3 color;\n"
//"void main()\n"
//"{\n"
//"gl_Position = vec4( position.x, position.y, position.z, 1.0f);\n"
//"}";

const GLchar *vertexShaderSource = "#version 330 core\n"
"layout (location = 0) in vec3 aPos;\n"
"layout (location = 1) in vec3 aColor;\n"
"out vec3 ourColor;\n"

"void main()\n"
"{\n"
"gl_Position = vec4(aPos, 1.0f);\n"
"ourColor = aColor;\n"
"}";

//const GLchar *fragmentShaderSource = "#version 330 core\n"
//"out vec4 color;\n"
//"in vec3 outColor;\n"
//"void main()\n"
//"{\n"
//"color = vec4(1.0f, 0.5f, 0.2f, 0.7f);\n"
//"}";

const GLchar *fragmentShaderSource = "#version 330 core\n"
"out vec4 FragColor;\n"
"in vec3 ourColor;\n"
"void main()\n"
"{\n"
"FragColor = vec4(ourColor, 1.0f);\n"
"}";

int main()
{
    glfwInit();
    // 窗口基本设置
    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3); // 主版本号
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
    glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);
    glfwWindowHint(GLFW_OPENGL_FORWARD_COMPAT, GL_TRUE); // must for mac 向前兼容
    glfwWindowHint(GLFW_RESIZABLE, GL_FALSE); // 不允许窗口改变
    
    // 创建窗口对象
    GLFWwindow *window = glfwCreateWindow(WIDTH, HEIGHT, "Learn OpenGL IDB16040426", nullptr, nullptr);
    
    // for retina display
    int screenWidth , screentHeight;
    glfwGetFramebufferSize(window, &screenWidth, &screentHeight);  // 获取 窗口像素，存入变量
    
    // 判断窗口是否创建失败
    if (nullptr == window) {
        std::cout << "Failed to create GLFW window" << std::endl;
        glfwTerminate();
        return -1;
    }
    
    glfwMakeContextCurrent(window); // 设置渲染的上下文为 当前窗口(window)
    
    glewExperimental = GL_TRUE;
    
    if (GLEW_OK != glewInit()){
        std::cout<<"Failed to init GLEW"<<std::endl;
        glfwTerminate();
        return -1;
    }
    
    glViewport(0,0,screenWidth, screentHeight);
    
    // import and compile the shaders
    GLuint vertexShader = glCreateShader(GL_VERTEX_SHADER);
    glShaderSource(vertexShader, 1, &vertexShaderSource, NULL);	// 加载字符串
    glCompileShader(vertexShader);	// 编译
    
    // 检查是否编译成功
    GLint success;
    GLchar infoLog[512];
    
    glGetShaderiv(vertexShader, GL_COMPILE_STATUS, &success);
    if (!success) {
        glGetShaderInfoLog(vertexShader, 512, NULL, infoLog);
        std::cout << "ERROR::SHADER::VERTEX::COMPILATION_FAILED\n" << infoLog << std::endl;
    }
    
    GLuint fragmentShader = glCreateShader(GL_FRAGMENT_SHADER);
    glShaderSource(fragmentShader, 1, &fragmentShaderSource, NULL);	// 加载字符串
    glCompileShader(fragmentShader);	// 编译
    // 检查是否编译成功
    glGetShaderiv(fragmentShader, GL_COMPILE_STATUS, &success);
    if (!success) {
        glGetShaderInfoLog(fragmentShader, 512, NULL, infoLog);
        std::cout << "ERROR::SHADER::FRAGMENT::COMPILATION_FAILED\n" << infoLog << std::endl;
    }
    // create program and link it
    GLuint shaderProgram = glCreateProgram();
    glAttachShader(shaderProgram, vertexShader);	// 把目标文件加入
    glAttachShader(shaderProgram, fragmentShader);
    glLinkProgram(shaderProgram);
    
    // 检查链接是否错误
    glGetProgramiv(shaderProgram, GL_LINK_STATUS, &success);
    if (!success) {
        glGetProgramInfoLog(shaderProgram, 512, NULL, infoLog);
        std::cout << "ERROR::PROGRAM::FRAGMENT::LINK_FAILED\n" << infoLog << std::endl;
    }
    
    glDetachShader(shaderProgram, vertexShader);
    glDetachShader(shaderProgram, fragmentShader);
    
    // 删除shader
    glDeleteShader(vertexShader);
    glDeleteShader(fragmentShader);
    
    
    GLfloat vertices[] = {
        -0.5f, -0.5f, 0.0f,  1.0f, 0.0f, 0.0f,
        0.5f, -0.5f, 0.0f,  0.0f, 1.0f, 0.0f,
        0.0f, 0.5f, 0.0f,  0.0f, 0.0f, 1.0f
    };
    
    GLuint VAO, VBO;
    
    glGenVertexArrays(1, &VAO);	// 传输数据
    glGenBuffers(1, &VBO);		// 解读数据
    
    // Bind vertex Array Object and Vertex Buffer Obeject
    glBindVertexArray(VAO);
    glBindBuffer(GL_ARRAY_BUFFER, VBO);
    
    // transfer the data
    glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);
    
    // Set the attributs
    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 6 * sizeof(GLfloat), (GLvoid *)0);
    glEnableVertexAttribArray(0);
    
    // Set color attributes
    glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, 6 * sizeof(GLfloat), (void*)(3* sizeof(float)));
    glEnableVertexAttribArray(1);
    
    // Unbind
    glBindBuffer(GL_ARRAY_BUFFER, 0);
    glBindVertexArray(0);
    
    while (!glfwWindowShouldClose(window))	// 绘制窗口
    {
        glfwPollEvents();	// 获得操作系统按键，保存
        glClearColor(0.2f, 0.3f, 0.3f, 1.0f); // 设置颜色
        glClear(GL_COLOR_BUFFER_BIT);	// 上色
        
        glUseProgram(shaderProgram);
        glBindVertexArray(VAO);
        glDrawArrays(GL_TRIANGLES, 0, 3);
        glBindVertexArray(0);
        
        glfwSwapBuffers(window);	// 显存足够可设置
    }
    
    glDeleteVertexArrays(1, &VAO);
    glDeleteBuffers(1, &VAO);
    glfwTerminate();	// 结束
    return 0;
}
